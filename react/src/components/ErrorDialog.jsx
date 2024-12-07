import React from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Terminal } from "lucide-react";

function ErrorDialog({errorTitle,msg}) {
    
  return (
    <div className="fixed top-4 right-4 p-4 rounded-lg shadow-lg">
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>{errorTitle}</AlertTitle>
        <AlertDescription>
          {msg}
        </AlertDescription>
      </Alert>
    </div>
  );
}

export default ErrorDialog;
