import PageLayout from '@/components/layout/page-layout'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ConfigurationApi } from '@/lib/api'
import { DatasetApi } from '@/lib/api/dataset'
import type { GetTokenResponse, ListDatasetsResponse } from '@/protocol/response'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Cloud, Plus } from 'lucide-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import useSWR from 'swr'
import * as z from 'zod'

const AddFromHubDialog: React.FC = () => {
  const [open, setOpen] = useState(false)

  // Define the form schema with zod
  const datasetFormSchema = z.object({
    datasetName: z
      .string()
      .min(1, 'Dataset name is required')
      .regex(/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/, 'Dataset name must be in format: hf_name/dataset_name'),
  })

  // Infer the form values type from the schema
  type DatasetFormValues = z.infer<typeof datasetFormSchema>

  // Placeholder API function for downloading dataset
  const downloadDatasetFromHub = async (datasetName: string): Promise<void> => {
    // Simulated API call - replace with actual API endpoint
    console.log(`Downloading dataset: ${datasetName}`)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Randomly succeed or fail for demonstration
    if (Math.random() > 0.5) {
      throw new Error(`Failed to download dataset ${datasetName}. Please check the dataset name and try again.`)
    }

    // In a real implementation, this would call your backend API
    // For example:
    // const response = await fetch('/api/datasets/download', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ datasetName }),
    // })
    // if (!response.ok) throw new Error('Failed to download dataset')
    // return response.json()
  }

  // Initialize the form with react-hook-form and zod resolver
  const form = useForm<DatasetFormValues>({
    resolver: zodResolver(datasetFormSchema),
    defaultValues: {
      datasetName: '',
    },
  })

  // Handle form submission
  const onSubmit = async (values: DatasetFormValues) => {
    try {
      await downloadDatasetFromHub(values.datasetName)
      toast.success(`Successfully started downloading dataset: ${values.datasetName}`)
      form.reset()
      setOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to download dataset')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add dataset from hub 🤗
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add dataset from hub 🤗</DialogTitle>
          <DialogDescription>
            Enter the Hugging Face dataset name to download: should be <code>hf_name/dataset_name</code>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="datasetName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dataset name</FormLabel>
                  <FormControl>
                    <Input placeholder="hf_name/dataset_name" {...field} disabled={form.formState.isSubmitting} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={form.formState.isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Download
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

const DatasetPageHeader: React.FC = () => {
  const [searchParams] = useSearchParams()
  const path = searchParams.get('path') || ''
  const pathParts = path.split('/').filter(Boolean)
  return (
    <div className="mb-4 flex w-full items-center justify-between">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <BreadcrumbLink asChild>
                    <Link to="/datasets">navrim</Link>
                  </BreadcrumbLink>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Explore your datasets in <code>~/navrim/recordings</code>
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {pathParts.map((part, index) => (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/browse?path=${pathParts.slice(0, index + 1).join('/')}`}>{part}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {index < pathParts.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <AddFromHubDialog />
    </div>
  )
}

const TokenWarningBanner: React.FC = () => {
  return (
    <div className="mb-4 w-full flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm">
      <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-500" />
      <div className="flex flex-1 items-center justify-between">
        <span className="text-amber-900 dark:text-amber-200">
          Hugging Face token is not set. Some features may not work properly.
        </span>
        <Link
          to="/configuration"
          className="ml-4 font-medium text-amber-700 underline hover:no-underline dark:text-amber-400"
        >
          Go to Settings
        </Link>
      </div>
    </div>
  )
}

const DatasetRow: React.FC<{ datasetName: string; isRemote: boolean }> = ({ datasetName, isRemote }) => {
  return (
    <TableRow>
      <TableCell className="w-[50px]" />
      <TableCell>
        <div className="flex items-center gap-2">
          {datasetName}
          {isRemote && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Cloud className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Remote dataset</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </TableCell>
      <TableCell></TableCell>
      <TableCell></TableCell>
      <TableCell></TableCell>
      <TableCell></TableCell>
      <TableCell></TableCell>
    </TableRow>
  )
}

const DatasetTable: React.FC<{ datasets: ListDatasetsResponse['datasets'] }> = ({ datasets }) => {
  return (
    <Table className="bg-background rounded-lg">
      <TableHeader>
        <TableRow>
          <TableCell className="w-[50px]" />
          <TableCell>Name</TableCell>
          <TableCell className="text-muted-foreground">Version</TableCell>
          <TableCell className="text-muted-foreground">Robot Type</TableCell>
          <TableCell className="text-muted-foreground">DOF</TableCell>
          <TableCell className="text-muted-foreground">Episodes</TableCell>
          <TableCell className="text-muted-foreground">Image Keys</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {datasets.map((dataset) => (
          <DatasetRow key={dataset.name} datasetName={dataset.name} isRemote={dataset.is_remote} />
        ))}
      </TableBody>
    </Table>
  )
}

export const DatasetPage: React.FC = () => {
  const { data: tokenData, error: tokenError } = useSWR<GetTokenResponse>(
    ConfigurationApi.endpoints.getToken.replace('/:tokenType/', `/huggingface/`),
    () => ConfigurationApi.getToken('huggingface'),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  )
  const hasToken = !tokenError && tokenData?.token && tokenData.token.trim() !== ''
  const { data: datasetsData } = useSWR<ListDatasetsResponse>(
    DatasetApi.endpoints.listDatasets,
    () => DatasetApi.listDatasets(),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  )

  return (
    <PageLayout className="items-start">
      <div className="container flex flex-1 flex-col items-start">
        <DatasetPageHeader />
        {!hasToken && <TokenWarningBanner />}
        <DatasetTable datasets={datasetsData?.datasets || []} />
      </div>
    </PageLayout>
  )
}
