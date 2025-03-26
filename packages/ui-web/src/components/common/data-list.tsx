import React from "react";
import ViewManager from "./view-manager";
import { AppmintTable, RowEvents, TableEvents } from "@appmint/form";

export const DataList = ({ schema, dataDTO }) => {

  const onRowEvent(event: RowEvents, rowId: string, row: any) => {
    console.log('onRowEvent', event, rowId, row);
  }

  const onTableEvent(event: TableEvents, options: any, selected: any[]) => {
    console.log('onTableEvent', event, options, selected);
  }

  return (
    <ViewManager id={dataDTO.datatype}>
      <AppmintTable datatype={dataDTO.datatype} schema={schema} data={dataDTO.data} onTableEvent={onTableEvent} onRowEvent={onRowEvent} />
    </ViewManager>
  );
};

