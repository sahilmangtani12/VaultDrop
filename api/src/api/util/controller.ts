import {
  Controller,
  Tags,
  Route,
  Get,
  OperationId,
} from "@tsoa/runtime";
import { AppInfo } from '../types/base';
import info from "./info";


@Route("/")
@Tags("Util")
export class UtilController extends Controller {
  @Get("healthy")
  @OperationId("healthy")
  public healthy(): { healthy: boolean } {
    return {
      healthy: true,
    };
  }

  @Get()
  @OperationId("info")
  public async info(): Promise<AppInfo> {
    return info();
  }
}
