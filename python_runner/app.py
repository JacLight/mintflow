import os
import time
import json
import redis
import requests
import logging
import threading

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [PythonRunner] %(message)s"
)

REDIS_HOST = os.environ.get("REDIS_HOST", "localhost")
REDIS_PORT = int(os.environ.get("REDIS_PORT", "6379"))
FLOWENGINE_URL = os.environ.get("FLOWENGINE_URL", "http://localhost:3000/flowengine")

# Optional: a comma-separated tenant list
TENANTS = os.environ.get("TENANTS", "tenantA,tenantB").split(",")

r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT)

def python_logic(taskName, taskInput):
    """
    Example Python tasks. Expand with your actual AI or ML code.
    """
    if taskName == "multiplyByTwo":
        if not isinstance(taskInput, (int, float)):
            raise ValueError("Input must be a number")
        return {"result": taskInput * 2}

    elif taskName == "uppercaseString":
        if not isinstance(taskInput, str):
            raise ValueError("Input must be a string")
        return {"result": taskInput.upper()}

    else:
        raise ValueError(f"Unknown Python taskName: {taskName}")

def process_job(tenantId, job_data):
    """
    Called by a worker thread to process one job from Redis.
    - job_data is a dict: { taskName, input, flowId, nodeId, tenantId }
    """
    flowId = job_data.get("flowId")
    nodeId = job_data.get("taskName")   # or rename if you prefer
    input_data = job_data.get("input")

    if not flowId or not nodeId:
        logging.error(f"Missing flowId or nodeId in job_data={job_data}")
        return

    try:
        # Do local Python logic
        result = python_logic(nodeId, input_data)
        # Notify orchestrator of success
        notify_flowengine_completion(tenantId, flowId, nodeId, result)
    except Exception as e:
        logging.error(f"Error in python_logic: {str(e)}")
        notify_flowengine_failure(tenantId, flowId, nodeId, str(e))

def notify_flowengine_completion(tenantId, flowId, nodeId, result):
    try:
        url = f"{FLOWENGINE_URL}/completeNode"
        payload = {
            "tenantId": tenantId,
            "flowId": flowId,
            "nodeId": nodeId,
            "result": result
        }
        resp = requests.post(url, json=payload, timeout=5)
        resp.raise_for_status()
        logging.info(f"Completed nodeId={nodeId} in flowId={flowId}")
    except Exception as e:
        logging.error(f"Error notifying completion: {e}")

def notify_flowengine_failure(tenantId, flowId, nodeId, errorMsg):
    try:
        url = f"{FLOWENGINE_URL}/failNode"
        payload = {
            "tenantId": tenantId,
            "flowId": flowId,
            "nodeId": nodeId,
            "errorMsg": errorMsg
        }
        resp = requests.post(url, json=payload, timeout=5)
        resp.raise_for_status()
        logging.info(f"Failed nodeId={nodeId} in flowId={flowId}")
    except Exception as e:
        logging.error(f"Error notifying failure: {e}")

def worker_loop(tenantId):
    """
    A single worker thread that repeatedly pops from pythonQueue_{tenantId} 
    and processes tasks.
    """
    queue_key = f"pythonQueue_{tenantId}"
    logging.info(f"Worker for {tenantId} started, queue={queue_key}")

    while True:
        job_raw = r.blpop(queue_key, timeout=5)
        if job_raw:
            # job_raw => (queue_key, job_data_bytes)
            _, job_data_bytes = job_raw
            try:
                job_data = json.loads(job_data_bytes)
                process_job(tenantId, job_data)
            except Exception as e:
                logging.error(f"Error parsing or processing job: {e}")
        else:
            # no job
            time.sleep(1)


def main():
    logging.info("PythonRunner starting up...")

    # For concurrency, start a thread per tenant (or multiple threads per tenant).
    threads = []
    for tenantId in TENANTS:
        t = threading.Thread(target=worker_loop, args=(tenantId,), daemon=True)
        t.start()
        threads.append(t)

    # Keep main thread alive
    while True:
        time.sleep(60)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logging.info("Shutting down runner due to KeyboardInterrupt.")
    except Exception as ex:
        logging.error(f"Fatal error in main(): {ex}")
