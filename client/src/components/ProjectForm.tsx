import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { insertProjectSchema, type InsertProject } from "@db/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject, updateProject } from "../lib/api";
import { useToast } from "@/hooks/use-toast";

interface ProjectFormProps {
  project?: {
    id: number;
    name: string;
    thumbnail_url?: string | null;
  };
  onSuccess?: () => void;
}

export function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!project;

  const form = useForm<InsertProject>({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      name: project?.name ?? "",
      thumbnail_url: project?.thumbnail_url || undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: InsertProject) =>
      isEditing 
        ? updateProject(project.id, { 
            name: data.name, 
            thumbnail_url: data.thumbnail_url || undefined 
          }) 
        : createProject({ 
            name: data.name, 
            thumbnail_url: data.thumbnail_url || undefined 
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({
        title: "Success",
        description: `Project ${isEditing ? "updated" : "created"} successfully`,
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="thumbnail_url"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Thumbnail URL</FormLabel>
              <FormControl>
                <Input 
                  {...field}
                  value={value || ""}
                  onChange={(e) => onChange(e.target.value || undefined)}
                  placeholder="Optional: Enter image URL"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending
            ? isEditing
              ? "Updating..."
              : "Creating..."
            : isEditing
            ? "Update Project"
            : "Create Project"}
        </Button>
      </form>
    </Form>
  );
}
