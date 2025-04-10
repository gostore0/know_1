import { google } from "@ai-sdk/google";
import { experimental_wrapLanguageModel as wrapLanguageModel } from "ai";
import { ragMiddleware } from "./rag-middleware";

export const customModel = wrapLanguageModel({
  model: google("gemini-2.0-flash-exp"),
  middleware: ragMiddleware,
});
