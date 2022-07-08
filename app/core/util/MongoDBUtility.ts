import { createSchema, typedModel } from "ts-mongoose";

export function saveObjectToMongoDB(constant: object, inputData: object) {
  const newDocument = getMongooseModel(constant) as any;
  const newDocumentInstance = new newDocument(inputData);
  return newDocumentInstance.save();
}

export function getMongooseModel(constant) {
  const schema = createSchema(constant.schema);
  try {
    return typedModel(constant.collectionName);
  } catch (e) {
    return typedModel(constant.collectionName, schema);
  }
}
