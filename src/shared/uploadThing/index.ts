import { createUploadthing } from 'uploadthing/express';

const f = createUploadthing();

export const uploadRouter = {
  profilePicture: f({
    image: { maxFileSize: '4MB', maxFileCount: 4 },
  }).onUploadComplete((data) => console.log('upload complete', { data })),
};

export type OurFileRouter = typeof uploadRouter;
