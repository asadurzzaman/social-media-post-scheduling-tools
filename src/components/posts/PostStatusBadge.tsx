import React from 'react';

type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

interface PostStatusBadgeProps {
  status: PostStatus;
}

export const PostStatusBadge = ({ status }: PostStatusBadgeProps) => {
  const getStatusStyles = (status: PostStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-500/10 text-yellow-600';
      case 'scheduled':
        return 'bg-orange-500/10 text-orange-600';
      case 'published':
        return 'bg-blue-500/10 text-blue-600';
      case 'failed':
        return 'bg-red-500/10 text-red-600';
      default:
        return 'bg-gray-500/10 text-gray-600';
    }
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusStyles(status as PostStatus)}`}>
      {status}
    </span>
  );
};