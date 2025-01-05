import { useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface ChatContainerProps {
  conversationId: string;
}

export const ChatContainer = ({ conversationId }: ChatContainerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { userId } = useUser();
  
  // Fetch messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Message[];
    },
  });

  // Send message mutation
  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async (content: string) => {
      if (!userId) throw new Error('User not authenticated');

      // First, insert user message
      const { data: userMessage, error: userError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content,
          role: 'user',
          user_id: userId
        })
        .select()
        .single();

      if (userError) throw userError;

      try {
        // Get Claude's response using Edge Function
        const { data, error } = await supabase.functions.invoke('chat-with-claude', {
          body: {
            messages: [...messages, { role: 'user', content }],
            conversationId,
          }
        });

        if (error) throw error;
        if (!data) throw new Error('No response from Claude');

        // Save Claude's response
        const { error: assistantError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            content: data.content,
            role: 'assistant',
            user_id: userId
          });

        if (assistantError) throw assistantError;
      } catch (error) {
        console.error('Error getting Claude response:', error);
        toast.error("Failed to get response from Claude");
        throw error;
      }
    },
    onError: (error) => {
      toast.error("Failed to send message");
      console.error('Error:', error);
    },
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!userId) {
    return <div className="flex items-center justify-center h-full">Please sign in to continue</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
          />
        ))}
        {isPending && (
          <ChatMessage
            role="assistant"
            content=""
            isLoading
          />
        )}
      </ScrollArea>
      <ChatInput 
        onSend={sendMessage} 
        isLoading={isPending}
      />
    </div>
  );
};