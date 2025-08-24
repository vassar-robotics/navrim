import PageLayout from '@/components/layout/page-layout'
import { BreadcrumbLink } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ConfigurationApi } from '@/lib/api'
import { DatasetApi } from '@/lib/api/dataset'
import type {
  BrowseDatasetResponse,
  DatasetInfoResponse,
  GetTokenResponse,
  ListDatasetsResponse,
} from '@/protocol/response'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, ChevronRight, Cloud, ExternalLink, File, Folder, Inbox, Plus } from 'lucide-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
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
  return (
    <div className="mb-4 flex w-full items-center justify-between">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <BreadcrumbLink asChild>
              <span className="text-muted-foreground ml-2">navrim</span>
            </BreadcrumbLink>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Explore your datasets in <code>~/navrim/recordings</code>
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
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

const DatasetRow: React.FC<{
  datasetName: string
  isRemote: boolean
  onClick: () => void
}> = ({ datasetName, isRemote, onClick }) => {
  const {
    data: datasetInfo,
    isLoading,
    error: datasetInfoError,
  } = useSWR<DatasetInfoResponse>(
    !isRemote ? [`/dataset/info/${datasetName}`, datasetName, isRemote] : null,
    () => DatasetApi.getDatasetInfo(datasetName, isRemote),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  )

  return (
    <TableRow key={`dataset-row-${datasetName}`}>
      <TableCell className="w-[50px]">
        <Checkbox key={`checkbox-${datasetName}`} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Link
            to="#"
            onClick={(e) => {
              e.preventDefault()
              onClick()
            }}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
          >
            {datasetName}
          </Link>
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
      {isRemote ? (
        <TableCell className="text-center text-muted-foreground" colSpan={5}>
          Click to view remote dataset on Hugging Face
        </TableCell>
      ) : datasetInfoError ? (
        <TableCell className="text-center text-muted-foreground" colSpan={5}>
          Error loading dataset info
        </TableCell>
      ) : (
        <>
          <TableCell className="text-center text-muted-foreground">
            {isLoading ? <Skeleton className="h-4 w-12 mx-auto" /> : datasetInfo?.version || 'unknown'}
          </TableCell>
          <TableCell className="text-center text-muted-foreground">
            {isLoading ? <Skeleton className="h-4 w-16 mx-auto" /> : datasetInfo?.robot_type || 'unknown'}
          </TableCell>
          <TableCell className="text-center text-muted-foreground">
            {isLoading ? <Skeleton className="h-4 w-8 mx-auto" /> : datasetInfo?.dof || 'unknown'}
          </TableCell>
          <TableCell className="text-center text-muted-foreground">
            {isLoading ? <Skeleton className="h-4 w-12 mx-auto" /> : datasetInfo?.episode_count || 'unknown'}
          </TableCell>
          <TableCell className="text-center text-muted-foreground">
            {isLoading ? <Skeleton className="h-4 w-16 mx-auto" /> : datasetInfo?.image_count || 'unknown'}
          </TableCell>
        </>
      )}
    </TableRow>
  )
}

const DatasetTableSkeleton: React.FC = () => {
  return Array.from({ length: 3 }).map((_, index) => (
    <TableRow key={`skeleton-${index}`}>
      <TableCell className="w-[50px]">
        <Skeleton className="h-4 w-4" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-12" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
    </TableRow>
  ))
}

const DatasetTable: React.FC<{
  datasets: ListDatasetsResponse['datasets'] | null
  isLoading: boolean
  onDatasetClick: (dataset: ListDatasetsResponse['datasets'][number]) => void
}> = ({ datasets, isLoading, onDatasetClick }) => {
  return (
    <Table className="bg-background rounded-lg">
      <TableHeader>
        <TableRow>
          <TableCell className="w-[50px]" />
          <TableCell>Name</TableCell>
          <TableCell className="text-muted-foreground text-center">Version</TableCell>
          <TableCell className="text-muted-foreground text-center">Robot Type</TableCell>
          <TableCell className="text-muted-foreground text-center">DOF</TableCell>
          <TableCell className="text-muted-foreground text-center">Episodes</TableCell>
          <TableCell className="text-muted-foreground text-center">Images</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <DatasetTableSkeleton />
        ) : datasets && datasets.length > 0 ? (
          datasets.map((dataset) => (
            <DatasetRow
              key={dataset.name}
              datasetName={dataset.name}
              isRemote={dataset.is_remote}
              onClick={() => onDatasetClick(dataset)}
            />
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="h-32 text-center">
              <div className="flex flex-col items-center justify-center">
                <Inbox className="h-12 w-12 text-muted-foreground/50" />
                <div className="text-center">
                  <p className="text-base font-medium text-foreground">No existing datasets</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Please add a dataset from the hub or record your own dataset
                  </p>
                </div>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

const DatasetViewDialog: React.FC<{
  dataset: ListDatasetsResponse['datasets'][number] | null
  onClose: () => void
}> = ({ dataset, onClose }) => {
  const open = !!dataset
  const [pathParts, setPathParts] = useState<string[]>([])
  const currentPath = pathParts.join('/')

  // Use SWR to fetch browse data
  const {
    data: browseData,
    isLoading,
    error,
  } = useSWR<BrowseDatasetResponse>(
    dataset && !dataset.is_remote
      ? [`/dataset/browse/${dataset.name}/${currentPath}`, dataset.name, dataset.is_remote, currentPath]
      : null,
    () => DatasetApi.browseDataset(dataset!.name, dataset!.is_remote, currentPath),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  )

  const handleOpenHuggingFace = () => {
    if (dataset?.name) {
      window.open(`https://huggingface.co/datasets/${dataset.name}`, '_blank')
    }
  }

  const handleNavigateToPath = (pathIndex: number) => {
    // Navigate to a specific depth in the path
    setPathParts(pathParts.slice(0, pathIndex))
  }

  const handleDirectoryClick = (directory: string) => {
    // Add the directory to the path
    setPathParts([...pathParts, directory])
  }

  const handleOpenChange = () => {
    onClose()
    setPathParts([])
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {dataset?.name}
            {dataset?.is_remote && <Cloud className="h-4 w-4 text-muted-foreground" />}
          </DialogTitle>
          <DialogDescription>
            {dataset?.is_remote ? 'View details about this remote dataset' : 'Browse and explore dataset contents'}
          </DialogDescription>

          {/* Path breadcrumbs for local datasets */}
          {!dataset?.is_remote && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
              <button onClick={() => handleNavigateToPath(0)} className="hover:text-foreground transition-colors">
                root
              </button>
              {pathParts.map((part, index) => (
                <React.Fragment key={index}>
                  <ChevronRight className="h-3 w-3" />
                  <button
                    onClick={() => handleNavigateToPath(index + 1)}
                    className="hover:text-foreground transition-colors"
                  >
                    {part}
                  </button>
                </React.Fragment>
              ))}
            </div>
          )}
        </DialogHeader>

        {dataset?.is_remote ? (
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
            <div className="flex items-start gap-3">
              <div className="w-full">
                <h4 className="mb-1 text-sm font-medium text-blue-900 dark:text-blue-200">Remote Dataset</h4>
                <p className="mb-3 text-sm text-blue-800 dark:text-blue-300">
                  This dataset is hosted on Hugging Face and is not stored locally. You can view more details about this
                  dataset on its Hugging Face page.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenHuggingFace}
                  className="border-blue-500/30 hover:bg-blue-500/10"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on Hugging Face
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : error ? (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                <p className="text-sm text-red-800 dark:text-red-300">
                  {error instanceof Error ? error.message : 'Failed to browse dataset'}
                </p>
              </div>
            ) : browseData ? (
              <div>
                {/* Directories */}
                <div>
                  {browseData.directories.map((directory) => (
                    <button
                      key={directory}
                      onClick={() => handleDirectoryClick(directory)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors text-left hover:underline"
                    >
                      <Folder className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        {directory}
                      </span>
                    </button>
                  ))}
                </div>
                {/* Files */}
                <div>
                  {browseData.files.map((file) => (
                    <div key={file} className="flex items-center gap-2 px-3 py-2 rounded-md">
                      <File className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{file}</span>
                    </div>
                  ))}
                </div>

                {/* Empty state */}
                {browseData.directories.length === 0 && browseData.files.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Inbox className="h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">This directory is empty</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export const DatasetPage: React.FC = () => {
  const {
    data: tokenData,
    isLoading: isTokenLoading,
    error: tokenError,
  } = useSWR<GetTokenResponse>(
    ConfigurationApi.endpoints.getToken.replace('/:tokenType/', `/huggingface/`),
    () => ConfigurationApi.getToken('huggingface'),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  )
  const hasToken = !tokenError && tokenData?.token && tokenData.token.trim() !== ''
  const { data: datasetsData, isLoading: isDatasetsLoading } = useSWR<ListDatasetsResponse>(
    DatasetApi.endpoints.listDatasets,
    () => DatasetApi.listDatasets(),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  )

  const [currentDataset, setCurrentDataset] = useState<ListDatasetsResponse['datasets'][number] | null>(null)

  return (
    <PageLayout className="items-start">
      <div className="container flex flex-1 flex-col items-start">
        <DatasetPageHeader />
        {!isTokenLoading && !hasToken && <TokenWarningBanner />}
        <DatasetTable
          datasets={datasetsData?.datasets || []}
          isLoading={isDatasetsLoading}
          onDatasetClick={setCurrentDataset}
        />
        <DatasetViewDialog dataset={currentDataset} onClose={() => setCurrentDataset(null)} />
      </div>
    </PageLayout>
  )
}
