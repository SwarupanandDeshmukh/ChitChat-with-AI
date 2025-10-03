import {WebContainer} from '@webcontainer/api';

let WebContainerInstance = null;

const getWebInstance =async ()=>{
    if(WebContainerInstance == null)
    {
        WebContainerInstance = await WebContainer.boot();
    }

    return WebContainerInstance;
};

export default getWebInstance;