import React from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Terminal } from "lucide-react";

function ErrorDialog({ errorTitle, msg }) {
  return (
    <div className="fixed right-4 top-4 rounded-lg p-4 shadow-lg">
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>{errorTitle}</AlertTitle>
        <AlertDescription>{msg}</AlertDescription>
      </Alert>
    </div>
  );
}

export default ErrorDialog;
