'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast"

export function EmbedCode({ scriptUrl }: { scriptUrl: string }) {
  const { toast } = useToast();
  
  const code = `<form id="customForm">
  <!-- Add your form fields here -->
  <input type="text" name="name" placeholder="Name" required>
  <button type="submit">Submit</button>
</form>

<script>
  document.getElementById('customForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      await fetch('${scriptUrl}', {
        method: 'POST',
        body: new URLSearchParams(formData)
      });
      alert('Submitted successfully!');
    } catch (error) {
      alert('Submission failed');
    }
  });
</script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    toast({ title: "Embed code copied to clipboard!" });
  };

  return (
    <div className="space-y-4">
      <Input value={code} readOnly className="font-mono text-sm" />
      <Button onClick={copyToClipboard}>Copy Embed Code</Button>
    </div>
  );
}