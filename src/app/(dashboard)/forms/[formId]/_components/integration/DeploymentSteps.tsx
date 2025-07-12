// app/forms/[formId]/components/integration/DeploymentSteps.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ExternalLink } from "lucide-react";

interface DeploymentStepsProps {
  scriptId: string;
  deploymentIdInput: string;
  onDeploymentIdChange: (value: string) => void;
  onSaveDeploymentId: () => void;
}

export function DeploymentSteps({
  scriptId,
  deploymentIdInput,
  onDeploymentIdChange,
  onSaveDeploymentId,
}: DeploymentStepsProps) {
  return (
    <Card className="border-green-100 mt-4">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <h4 className="font-medium">Deployment Required</h4>
        </div>
        
        <div className="space-y-2 text-sm">
          <p className="font-medium mb-2">Follow these steps:</p>
          
          {/* Step 1 */}
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-700">1</span>
            </div>
            <div>
              <p>Open the <a 
                href={`https://script.google.com/d/${scriptId}/edit`}
                target="_blank"
                className="text-green-700 underline"
                rel="noopener noreferrer"
              >
                Apps Script Editor
                <ExternalLink className="inline-block w-4 h-4 ml-1" />
              </a></p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-700">2</span>
            </div>
            <div>
              <p>In the script editor:</p>
              <ul className="list-disc pl-6 mt-1">
                <li>Click <strong>Deploy</strong> → <strong>Manage Deployments</strong></li>
                <li>Select <strong>Web App</strong> as deployment type</li>
                <li>Set:
                  <ul className="list-disc pl-6 mt-1">
                    <li>Execute as: <strong>Me</strong></li>
                    <li>Who has access: <strong>Anyone</strong></li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-700">3</span>
            </div>
            <div>
              <p>After deployment, copy the Deployment ID from the dialog</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-700">4</span>
            </div>
            <div className="w-full">
              <Label>Paste Deployment ID Here:</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={deploymentIdInput}
                  onChange={(e) => onDeploymentIdChange(e.target.value)}
                  placeholder="Paste your deployment ID here"
                  className="flex-1"
                />
                <Button 
                  onClick={onSaveDeploymentId}
                  disabled={!deploymentIdInput}
                  className="bg-green-600 text-white"
                >
                  Save Deployment
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}