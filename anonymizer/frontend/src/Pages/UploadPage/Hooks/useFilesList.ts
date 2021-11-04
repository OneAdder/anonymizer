import { useSelector } from "react-redux";
import { AppState } from '@root/Redux/store';



export const useFilesList = () => {
    const data = useSelector((state:AppState) => state.Pages.UploadPage.files);
    return Object.values(data);
};

export default useFilesList;