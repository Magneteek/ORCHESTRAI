'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Copy, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TemplateForm } from '@/components/templates/template-form';
import { apiClient } from '@/lib/helpers/api-client';
import { useToast } from '@/hooks/use-toast';
import type { AdTemplate } from '@prisma/client';

export default function EditTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const templateId = params.id as string;

  // Fetch template
  const { data: template, isLoading } = useQuery<AdTemplate>({
    queryKey: ['template', templateId],
    queryFn: async () => {
      return apiClient.get<AdTemplate>(`/api/templates/${templateId}`);
    },
  });

  // Update template
  const updateTemplate = useMutation({
    mutationFn: async (data: any) => {
      return apiClient.patch(`/api/templates/${templateId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template', templateId] });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: 'Template updated successfully',
        description: 'Your changes have been saved.',
      });
      router.push('/dashboard/templates');
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update template',
        description: error.message || 'An error occurred while updating the template.',
        variant: 'destructive',
      });
    },
  });

  // Fork/Clone template
  const forkTemplate = useMutation({
    mutationFn: async () => {
      return apiClient.post(`/api/templates/${templateId}/fork`);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: 'Template cloned successfully',
        description: 'A copy of the template has been created.',
      });
      router.push(`/dashboard/templates/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to clone template',
        description: error.message || 'An error occurred while cloning the template.',
        variant: 'destructive',
      });
    },
  });

  // Delete template
  const deleteTemplate = useMutation({
    mutationFn: async () => {
      return apiClient.delete(`/api/templates/${templateId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: 'Template deleted',
        description: 'The template has been permanently deleted.',
      });
      router.push('/dashboard/templates');
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete template',
        description: error.message || 'An error occurred while deleting the template.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (data: any) => {
    await updateTemplate.mutateAsync(data);
  };

  const handleCancel = () => {
    router.push('/dashboard/templates');
  };

  const handleFork = () => {
    forkTemplate.mutate();
  };

  const handleDelete = () => {
    deleteTemplate.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Loading template...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Template not found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The template you're looking for doesn't exist or has been deleted.
          </p>
          <Link href="/dashboard/templates">
            <Button className="mt-4">Back to Templates</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/templates">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Template</h1>
            <p className="text-muted-foreground">{template.name}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleFork}
            disabled={forkTemplate.isPending}
          >
            {forkTemplate.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Copy className="mr-2 h-4 w-4" />
            Clone
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Template Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Times Used</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{template.timesUsed}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Version</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{template.version}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Visibility</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold capitalize">{template.visibility}</p>
          </CardContent>
        </Card>
      </div>

      {/* Template Form */}
      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
          <CardDescription>
            Update the template configuration below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TemplateForm
            template={template}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={updateTemplate.isPending}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{template.name}"? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleteTemplate.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteTemplate.isPending}
            >
              {deleteTemplate.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
