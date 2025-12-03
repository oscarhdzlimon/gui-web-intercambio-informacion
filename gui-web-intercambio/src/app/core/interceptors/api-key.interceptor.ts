import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Observable} from "rxjs";

export class ApiKeyInterceptor implements  HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const apiKey = 'YjRkZjFhYmE5NTAzZTRmNmNiOTdhM2Q2YzVhM2Q0NTNjOGI3MDYxY2YwNDU4M2JkNzdiNDI3NGY2YWE5M2I5';

    const modifiedReq = req.clone({
      setHeaders: {
        'CME-REGISTRO-API-KEY': apiKey
      }
    });

    return next.handle(modifiedReq);
  }
}
