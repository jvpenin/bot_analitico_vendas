import { FileUploadSidebar } from "@/components/FileUploadSidebar";
import { ChatInterface } from "@/components/ChatInterface";

const Index = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <FileUploadSidebar />
      <ChatInterface />
    </div>
  );
};

export default Index;
