// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

'use strict';

import { QuickPickItem } from 'vscode';

interface IJupyterServerUri {
  baseUrl: string;
  token: string;

  authorizationHeader: any; // JSON object for authorization header.
  expiration?: Date; // Date/time when header expires and should be refreshed.
  displayName: string;
}

type JupyterServerUriHandle = string;

export interface IJupyterUriProvider {
  readonly id: string; // Should be a unique string (like a guid)
  getQuickPickEntryItems(): QuickPickItem[];
  handleQuickPick(
    item: QuickPickItem,
    backEnabled: boolean
  ): Promise<JupyterServerUriHandle | 'back' | undefined>;
  getServerUri(handle: JupyterServerUriHandle): Promise<IJupyterServerUri>;
}

interface IDataFrameInfo {
  columns?: { key: string; type: ColumnType }[];
  indexColumn?: string;
  rowCount?: number;
}

export interface IDataViewerDataProvider {
  dispose(): void;
  getDataFrameInfo(): Promise<IDataFrameInfo>;
  getAllRows(): Promise<IRowsResponse>;
  getRows(start: number, end: number): Promise<IRowsResponse>;
}

enum ColumnType {
  String = 'string',
  Number = 'number',
  Bool = 'bool',
}

type IRowsResponse = any[];
