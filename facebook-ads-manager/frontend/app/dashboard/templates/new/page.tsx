'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TemplateForm } from '@/components/templates/template-form';
import { apiClient } from '@/lib/helpers/api-client';
import { useToast } from '@/hooks/use-toast';

export default function NewTemplatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createTemplate = useMutation({
    mutationFn: async (data: any) => {
      return apiClient.post('/api/templates', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: 'Template created successfully',
        description: 'Your template has been saved and can now be used.',
      });
      router.push('/dashboard/templates');
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create template',
        description: error.message || 'An error occurred while creating the template.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (data: any) => {
    await createTemplate.mutateAsync(data);
  };

  const handleCancel = () => {
    router.push('/dashboard/templates');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/templates">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Ad Template</h1>
          <p className="text-muted-foreground">
            Create a reusable template for your Facebook ad campaigns
          </p>
        </div>
      </div>

      {/* Benefits Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Why create templates?</CardTitle>
          <CardDescription>
            Templates help you launch campaigns faster and maintain consistency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <div>
                <span className="font-medium">Save Time</span>
                <p className="text-muted-foreground">
                  Reuse proven ad structures instantly
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <div>
                <span className="font-medium">Maintain Brand</span>
                <p className="text-muted-foreground">
                  Ensure consistent messaging
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <div>
                <span className="font-medium">Share Knowledge</span>
                <p className="text-muted-foreground">
                  Make templates public to help others
                </p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Template Form */}
      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
          <CardDescription>
            Fill in the information below to create your template
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TemplateForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={createTemplate.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
