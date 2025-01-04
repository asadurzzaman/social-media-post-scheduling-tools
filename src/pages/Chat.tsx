import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Chat = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Fetch conversations
  const { data: conversations = [], refetch } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Create new conversation
  const { mutate: createConversation } = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setSelectedConversationId(data.id);
      refetch();
      toast.success("New conversation started");
    },
    onError: () => {
      toast.error("Failed to create conversation");
    },
  });

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-64 border-r p-4 flex flex-col gap-4">
          <Button
            onClick={() => createConversation()}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
          
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <Button
                key={conversation.id}
                variant={selectedConversationId === conversation.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedConversationId(conversation.id)}
              >
                {conversation.title || "New conversation"}
              </Button>
            ))}
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1">
          {selectedConversationId ? (
            <ChatContainer conversationId={selectedConversationId} />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a conversation or start a new one
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Chat;