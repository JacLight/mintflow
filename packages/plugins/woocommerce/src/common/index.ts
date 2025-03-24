import axios from 'axios';

export const wooCommon = {
  baseUrl: (auth: { baseUrl: string }) => auth.baseUrl,
  
  async makeRequest(
    method: string,
    url: string,
    auth: { baseUrl: string; consumerKey: string; consumerSecret: string },
    body?: any,
    queryParams?: Record<string, string>
  ) {
    const fullUrl = `${auth.baseUrl}${url}`;
    
    try {
      const response = await axios({
        method,
        url: fullUrl,
        params: queryParams,
        data: body,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${auth.consumerKey}:${auth.consumerSecret}`
          ).toString('base64')}`,
        },
      });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Error making request to WooCommerce API:', error);
      
      if (error.response) {
        return {
          success: false,
          error: `Error: ${error.response.status} - ${error.response.statusText}`,
          data: error.response.data,
        };
      }
      
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
      };
    }
  },
};
