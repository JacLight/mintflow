import React, { useState, useEffect } from "react";
import ViewManager from "./view-manager";
import { AppmintTable, RowEvents, TableEvents } from "@appmint/form";
import { BaseModelDTO } from "../../lib/models/base.model";
import { getMintflowService } from "../../lib/mintflow-service";
import { MintflowSchema } from "../../lib/models/flow-model";
import { getResponseErrorMessage } from "@/lib/utils";
import { useSiteStore } from "@/context/site-store";

interface DataListProps {
  datatype?: string;
  show?: boolean;
  onRowClick?: (rowId: string, row: any) => void;
  onClose?: () => void;
}

export const DataList: React.FC<DataListProps> = ({
  datatype,
  onRowClick,
  show,
  onClose,
}) => {
  const [dataDTO, setDataDTO] = useState<BaseModelDTO<any> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const mintflowService = getMintflowService();

  // Fetch flows if dataDTO is not provided
  useEffect(() => {
    if (!dataDTO) {
      fetchFlows();
    }
  }, [dataDTO]);

  const fetchFlows = async () => {
    setLoading(true);
    setError(null);
    try {
      const flows = await mintflowService.getFlows();
      setDataDTO(flows);
    } catch (err) {
      const msg = getResponseErrorMessage(err);
      useSiteStore().ui.getState().showNotice(msg, 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!show) {
    return null;
  }

  const onRowEvent = (event: RowEvents, rowId: string, row: any) => {
    console.log('onRowEvent', event, rowId, row);
    // Convert event to string for comparison
    const eventName = String(event);

    if (eventName === 'click' && onRowClick) {
      onRowClick(rowId, row);
    } else if (eventName === 'delete') {
      handleDelete(rowId);
    }
  };

  const onTableEvent = (event: TableEvents, options: any, selected: any[]) => {
    console.log('onTableEvent', event, options, selected);

    // Convert event to string for comparison
    const eventName = String(event);

    if (eventName === 'refresh') {
      fetchFlows();
    }
  };

  const handleDelete = async (rowId: string) => {

  };

  if (loading) {
    return <div className="p-4">Loading flows...</div>;
  }


  const schema = MintflowSchema();
  return (
    <ViewManager id={dataDTO?.datatype || 'mintflow'} onClose={onClose}>
      <AppmintTable
        datatype="mintflow"
        schema={schema || MintflowSchema()}
        data={dataDTO?.data || []}
        onTableEvent={onTableEvent}
        onRowEvent={onRowEvent}
      />
    </ViewManager>
  );
};
