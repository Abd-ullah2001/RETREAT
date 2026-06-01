import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createInquiry, getInquiries, markInquirySent, updateInquiryMessage } from '@/lib/api';

export function useInquiries() {
  return useQuery({
    queryKey: ['inquiries'],
    queryFn: getInquiries,
    staleTime: 5 * 60 * 1000,
  });
}

export function useInquiryMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['inquiries'] });

  return {
    createInquiry: useMutation({ mutationFn: createInquiry, onSuccess: invalidate }),
    updateMessage: useMutation({
      mutationFn: ({ id, message }: { id: string; message: string }) => updateInquiryMessage(id, message),
      onSuccess: invalidate,
    }),
    markSent: useMutation({ mutationFn: markInquirySent, onSuccess: invalidate }),
  };
}
