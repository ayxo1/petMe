import { pb } from "@/backend/config/pocketbase";

export const stringImageToPbUrl = (stringImageName: string, collection: string, userId: string): string => {
    return `${pb.baseURL}/api/files/${collection}/${userId}/${stringImageName}`;
};