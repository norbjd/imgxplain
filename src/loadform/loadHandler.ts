import { LoadInput } from "./loadInput";

interface LoadHandler {
  load(): Promise<LoadInput>;
}

export { LoadHandler };