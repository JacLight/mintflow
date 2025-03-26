
export enum SortType {
  desc = -1,
  asc = 1,
}

export enum ModelState {
  draft = 'draft',
  new = 'new',
  pending = 'pending',
  inprogress = 'inprogress',
  reviewed = 'reviewed',
  approved = 'approved',
  published = 'published',
  completed = 'completed',
  hold = 'hold',
  rejected = 'rejected',
  cancelled = 'cancelled',
  archived = 'archived',
  deleted = 'deleted',
}

export interface DataOptions {
  sort?: any;
  sortType?: SortType;
  modelState?: ModelState | ModelState[];
  lastItem?: string;
  page?: number;
  pageSize?: number;
  lastPage?: number;
  refresh?: boolean;
  enrich?: boolean;
  hasNext?: boolean;
  excludeFields?: string[];
  includeFields?: string[];
  maskFields?: string[];
  random?: boolean;
}

export interface BaseModelDTO<T> extends DataOptions {
  total?: number;
  datatype?: string;
  error?: { message: string; code: number; stalk: any };
  data?: BaseModel<T>[];
  fromCache?: boolean;
}

export interface BaseModel<T> {
  pk: string;
  sk: string;
  name: string;
  data?: T;
  isNew?: boolean;
  datatype?: string;
  subschema?: string;
  workflow?: any;
  post?: any;
  style?: any;
  version: number;
  createdate?: Date;
  modifydate?: Date;
  author?: string;
  requiredRole?: any;
  comments?: any[];
  activities?: any[];
  messages?: any[];
  schedules?: any[];
  schedule?: any;
  shares?: number;
  likes?: number;
  dislikes?: number;
  averageRating?: number;
  ratingCount?: number;
  owner?: {
    datatype?: string;
    id?: string;
    name?: string;
    email?: string;
  },
  state?: ModelState;
  search?: string;
  create_hash?: string;
  reactions?: any[];
  modified_by?: string;
  created_by?: string;
  views?: number;
  last_viewed?: Date;
  client?: string;
}


export const createNewBaseData = (datatype: string, data: any, owner?: { datatype: string, id: string }, author?: string): BaseModel<any> => {
  const newBaseData: BaseModel<any> = {
    pk: '',
    sk: '',
    name: data?.name || data?.username || data?.email || data?.title,
    datatype: datatype,
    data: data || {},
    isNew: true,
    version: 0,
    owner: owner,
    ...(author ? { author } : {})
  };
  return newBaseData;
}
