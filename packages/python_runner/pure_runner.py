import os
import time
import json
import redis
import requests
import logging
import sys
import traceback

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [PurePythonRunner] %(message)s"
)

REDIS_HOST = os.environ.get("REDIS_HOST", "localhost")
REDIS_PORT = int(os.environ.get("REDIS_PORT", "6379"))
FLOWENGINE_URL = os.environ.get("FLOWENGINE_URL", "http://localhost:3000/flowengine")
TENANTS = os.environ.get("TENANTS", "tenantA,tenantB").split(",")

# concurrency threads if you want
# For simplicity, single-thread here. You can expand to multiple threads.

r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT)

def main():
    logging.info("PurePythonRunner starting with tenants=%s", TENANTS)
    # We'll poll each tenant's queue in a loop
    while True:
        found_job = False
        for tenant in TENANTS:
            queue_key = f"pythonQueue_{tenant}"
            job_raw = r.blpop(queue_key, timeout=1)
            if job_raw:
                found_job = True
                _, data_bytes = job_raw
                try:
                    job_data = json.loads(data_bytes)
                    process_job(tenant, job_data)
                except Exception as e:
                    logging.error("Error in process_job: %s", e)
        # If no job found for any tenant, sleep
        if not found_job:
            time.sleep(0.5)

def process_job(tenantId, job_data):
    flowId = job_data.get("flowId")
    nodeId = job_data.get("nodeId") or job_data.get("functionName")  # or however you store it
    code = job_data.get("code")
    function_name = job_data.get("functionName")
    input_data = job_data.get("input")

    if not flowId or not nodeId or not code:
        logging.error("Missing flowId/nodeId/code in job_data=%s", job_data)
        return

    try:
        # Run code in restricted environment
        result = run_untrusted_code(code, function_name, input_data)
        notify_flowengine_complete(tenantId, flowId, nodeId, result)
    except Exception as e:
        logging.error("Error running untrusted code: %s", e)
        notify_flowengine_fail(tenantId, flowId, nodeId, str(e))

def run_untrusted_code(code_str, function_name, input_data):
    """
    Minimal 'exec' example with a restricted namespace.
    In production, use containers or microVMs for real isolation.
    """
    restricted_globals = {
        "__builtins__": {
            "range": range, "len": len, "print": print,
            # only expose minimal builtins. remove 'exec', 'eval', etc.
        }
    }
    restricted_locals = {}

    # Execute the code, which presumably defines a function
    exec(code_str, restricted_globals, restricted_locals)

    # If function_name provided, call that. Otherwise, assume default 'main'
    if function_name:
        func = restricted_locals.get(function_name)
        if not func:
            raise ValueError(f"Function '{function_name}' not found in code.")
    else:
        # assume there's a 'main'?
        func = restricted_locals.get("main")
        if not func:
            raise ValueError("No function_name given, and 'main' not found in code.")

    # Now call it with input_data
    return func(input_data)

def notify_flowengine_complete(tenantId, flowId, nodeId, result):
    try:
        resp = requests.post(
            f"{FLOWENGINE_URL}/completeNode",
            json={"tenantId": tenantId, "flowId": flowId, "nodeId": nodeId, "result": result},
            timeout=5
        )
        resp.raise_for_status()
        logging.info("Completed nodeId=%s flowId=%s successfully", nodeId, flowId)
    except Exception as e:
        logging.error("Error notifying completeNode: %s", e)

def notify_flowengine_fail(tenantId, flowId, nodeId, errorMsg):
    try:
        resp = requests.post(
            f"{FLOWENGINE_URL}/failNode",
            json={"tenantId": tenantId, "flowId": flowId, "nodeId": nodeId, "errorMsg": errorMsg},
            timeout=5
        )
        resp.raise_for_status()
        logging.info("Failed nodeId=%s flowId=%s reported", nodeId, flowId)
    except Exception as e:
        logging.error("Error notifying failNode: %s", e)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logging.info("Exiting by KeyboardInterrupt.")
    except Exception as ex:
        logging.error("Fatal error: %s", ex)
        sys.exit(1)
