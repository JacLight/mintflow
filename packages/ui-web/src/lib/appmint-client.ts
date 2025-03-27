import { appmintConfig } from "./appmint-config";
import axios from "axios";
import { appmintEndpoints } from './appmint-endpoints';
import { deepCopy } from "./utils";
import { getProxiedUrl } from "./proxy-utils";

export class AppEngineClient {
  private renewTries = 0;
  private token: string | null = null;

  constructor(private appConfig: any) { }

  async getToken() {
    const path = getProxiedUrl(appmintEndpoints.appkey.path, this.appConfig.appengine.host, 'appmint');
    let data = {
      appId: this.appConfig.appengine.appId,
      secret: this.appConfig.appengine.secret,
      key: this.appConfig.appengine.key,
    };
    this.renewTries = this.renewTries + 1;
    const rt = await axios.post(path, data, this.getBaseHeader());
    if (rt?.data?.token) {
      return rt.data.token;
    } else {
      console.error('invalid  App Key | App Secret || App Id');
      return null;
    }
  }

  getUserFromToken(auth_token: string) {
    if (!auth_token) {
      console.error('user auth_token is undefined');
      return null;
    }

    try {
      const token = auth_token.split(' ')[1];
      const user = { sk: '', token }; // decode(token) as BaseModel<UserModel>;
      return user;
    } catch (err) {
      console.error(err);
    }
    return null;
  }

  getBaseHeader(): { headers: any } {
    return {
      headers: {
        'Content-Type': 'application/json',
        orgid: this.appConfig.orgId,
        domainAsOrg: this.appConfig.domainAsOrg,
        'shared-org-id': this.appConfig.orgId
      },
    };
  }

  async getHeaderWithToken() {
    if (!this.token) {
      this.token = await this.getToken();
    }
    const init = this.getBaseHeader();
    init.headers['Authorization'] = `Bearer ${this.token}`;
    return deepCopy(init);
  }

  async processRequest(
    method: string,
    clientPath: string,
    clientData?: any,
    clientAuthorization?: string | null,
    clientQuery?: any,
    clientInfo?: any,
    isMultiPath?: boolean
  ): Promise<any> {
    const path = getProxiedUrl(clientPath, this.appConfig.appengine.host, 'appmint');
    console.log('path -> ', path);
    const header: any = typeof window !== 'undefined' ? { header: {} } : await this.getHeaderWithToken();
    if (clientAuthorization) {
      header.headers['x-client-authorization'] = clientAuthorization
    }
    if (clientInfo) {
      header.headers['x-client-info'] = JSON.stringify(clientInfo)
      header.headers['x-client-host'] = clientInfo['host']
      header.headers['x-client-protocol'] = clientInfo['protocol']
    }

    if (isMultiPath) {
      header.headers['Content-Type'] = 'multipart/form-data';
    }
    const data = clientData;
    if (data) {
      data.clientQuery = clientQuery;
    }
    method = method.toLowerCase();
    console.log('request starting  -> ', method, clientPath, path);
    let rt;
    try {
      if (method === 'post') {
        rt = await axios.post(path, data, header);
      } else if (method === 'put') {
        rt = await axios.put(path, data, header);
      } else if (method === 'get') {
        rt = await axios.get(path, header);
      } else if (method === 'delete') {
        rt = await axios.delete(path, header);
      }
      this.renewTries = 0;
      console.log('request success -> ', method, clientPath);
      console.log('response -> ', rt?.data);
      return this.processResponse(rt);
    } catch (err) {
      const error = err as any;
      // console.error('request error -> ', clientPath, error.message);
      if (
        this.renewTries < 2 &&
        error?.response?.status === 401 &&
        error?.response?.statusText === 'Unauthorized'
      ) {
        console.log('Appengine Token Expired,.... renewing token');
        this.token = null;
        await this.getHeaderWithToken();
        console.log('auth ok')
        return await this.processRequest(method, clientPath, clientData, clientAuthorization, clientQuery, clientInfo, isMultiPath);
      } else {
        throw error;
      }
    }
  }

  async getSite(hostName: string) {
    const sharedHost = this.appConfig.domainAsOrg ? this.appConfig.orgId : ''
    let sitePath = `${appmintEndpoints.get_site.path}/${this.appConfig.siteName}/${hostName}${sharedHost ? '?shared-host=' + sharedHost : ''}`;
    return await this.processRequest('get', sitePath)
  }

  async getPage(hostName: string, siteName: string, paths: string, query?: string, clientInfo?: any) {
    const sharedHost = this.appConfig.domainAsOrg ? this.appConfig.orgId : ''
    let pagePath = `${appmintEndpoints.get_page.path}/${hostName}/${siteName}${paths ? '/' + paths : ''}`;
    if (query) {
      pagePath = `${pagePath}?${query}&en=true${sharedHost ? '&shared-host=' + sharedHost : ''}`;
    } else {
      pagePath = `${pagePath}?en=true${sharedHost ? '&shared-host=' + sharedHost : ''}`;
    }

    if (clientInfo) {
      clientInfo['host'] = hostName
    } else {
      clientInfo = { host: hostName }
    }
    return await this.processRequest('get', pagePath, null, null, null, clientInfo);
  }

  async getPreviewPage(orgId: string, site: string, page: string, token: string) {
    return await this.processRequest('get', `tools/preview/${orgId}/${site}/${page}?token=${token}`,);
  }

  async logData(data: any) {
    const sitePath = `${appmintEndpoints.batch_log_data}`;
    const rt: any = await this.processRequest('post', sitePath, data, null, null);
    if (rt && Array.isArray(rt.data) && rt.data.length > 0) {
      const [site] = rt.data;
      return site;
    }
    return null;
  }


  async upload(path: string, location: string, file: any): Promise<any> {
    console.debug('request -> updateData', path);
    const formData = new FormData();
    formData.append('location', location);
    formData.append('files', file);

    // Get the proxied URL if needed
    const proxyPath = getProxiedUrl(path, this.appConfig.appengine.host, 'appmint');

    // let rt = await axios.post(path, formData, getHeaderToken());
    try {
      let rt = await fetch(proxyPath, {
        method: 'POST',
        headers: new Headers({
          ...((await this.getHeaderWithToken()) as Record<string, any>),
        }),
        body: formData,
      });

      if (rt.ok) {
        return rt.json();
      } else {
        throw new Error(rt.statusText);
      }
    } catch (err) {
      const error = err as any;
      if (
        this.renewTries < 2 &&
        error.statusCode === '401' &&
        error.message === 'jwt expired'
      ) {
        console.log('Appengine Token Expired,.... renewing token');
        this.token = null;
        return await this.upload(path, location, file);
      } else {
        console.error(error.message);
        return error;
      }
    }
  }

  processResponse(response: any) {
    if (
      response &&
      (response.status === 200 ||
        response.status === 201 ||
        response.status === 202 ||
        response.statusText)
    ) {
      console.log('response success -> ', response.status, response.statusText);
      return Array.isArray(response) ? response : response.data;
    }
    return response;
  }
}

let appEngineClient: AppEngineClient;
export const getAppEngineClient = (): AppEngineClient => {
  if (!appEngineClient) {
    appEngineClient = new AppEngineClient(appmintConfig)
  }
  return appEngineClient;
}
