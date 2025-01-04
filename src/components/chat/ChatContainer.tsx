import { useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

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
      // First, insert user message
      const { data: userMessage, error: userError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content,
          role: 'user',
        })
        .select()
        .single();

      if (userError) throw userError;

      // Then, get Claude's response
      const response = await fetch('/functions/v1/chat-with-claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content }],
          conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Claude');
      }

      const claudeResponse = await response.json();

      // Finally, save Claude's response
      const { error: assistantError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: claudeResponse.content,
          role: 'assistant',
        });

      if (assistantError) throw assistantError;
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