"use client"
import React, { useEffect, useState } from 'react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import employeeApiRequest from '@/apis/employee.api'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Chart, chartDefault, chartSchema, ChartType } from '@/data/schema/flexibleDashboard.schema'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/custom/button'
import { handleSuccessApi } from '@/lib/utils'
const QUERY_KEY = {
    KEY: 'properties',
    MUTATE: 'create-flexible-dashboard',
}
type FormProps = {
    openCRUD: boolean,
    setOpenCRUD: (openCRUD: boolean) => void,
    pageFlexibleDashboardId: number
}
export type TypeResult = {
    value: string;
    valueType: string;
};
export type labelResult = {
    label: string,
    value: number
}
export default function FormCRUD(props: FormProps) {
    const [propertyNames, setPropertyNames] = useState<string[]>([]);
    const { openCRUD = false, setOpenCRUD = () => { }, pageFlexibleDashboardId } = props;
    const queryClient = useQueryClient()
    const addToStatistics = (propertyName: string, metadata: Record<string, TypeResult>[]): labelResult[] => {
        const valueCount = new Map<string, number>();
        metadata.forEach((item) => {
            const propertyData = item[propertyName];
            console.log(propertyData)
            if (propertyData) {
                const value = propertyData.value;
                const count = valueCount.get(value) ?? 0;
                valueCount.set(value, count + 1);
            }
        });
        return mapToLabelResult(valueCount)
    };
    const mapToLabelResult = (data: Map<string, number>): labelResult[] => {
        return Array.from(data, ([label, value]) => ({ label, value }));
    };
    const { data, isLoading } = useQuery({
        queryKey: [QUERY_KEY.KEY],
        queryFn: () => employeeApiRequest.flexibleDashboard()
    })
    const form = useForm<Chart>({
        resolver: zodResolver(chartSchema),
        defaultValues: chartDefault,
    });
    const handleOnSubmit = () => {
        const value: Chart = form.getValues()
        mutate({
            pageFlexibleDashboardId: pageFlexibleDashboardId,
            data: JSON.stringify(addToStatistics(value.propertyName!, data?.metadata!)),
            title: value.title,
            size: Number(value.size),
            chartType: Number(value.chartType),
            propertyName: value.propertyName,
            firstDescription: value.firstDescription,
            secondDescription: value.secondDescription,
        })
    }

    const { mutate } = useMutation({
        mutationFn: (data: Chart) => employeeApiRequest.createNewChart(data),
        onSuccess: (data) => {
            if (data.isSuccess) {
                handleSuccessApi({ message: "Insert successfully" })
                setOpenCRUD(false);
                form.reset()
                queryClient.invalidateQueries({queryKey : ["charts"]})
            }
        }
    })

    useEffect(() => {
        if (data?.metadata) {
            const properties = new Set<string>();
            data.metadata.forEach(item => {
                Object.keys(item).forEach(key => {
                    properties.add(key);
                })
            });
            setPropertyNames(Array.from(properties));
        }
    }, [data, isLoading]);
    return (
        <Form {...form}>
            <form className="space-y-0">
                <Sheet open={openCRUD} onOpenChange={setOpenCRUD}>
                    <SheetTrigger asChild>
                    </SheetTrigger>                    <SheetContent className="p-0 overflow-y-auto sm:max-w-[800px] !sm:w-[800px] min-w-[800px]">
                        <SheetHeader className='px-4 pt-3'>
                            <SheetTitle>Dashboard Interface</SheetTitle>
                            <SheetDescription>
                                Below is the chart interface for your statistics
                            </SheetDescription>
                        </SheetHeader>
                        <div className="grid gap-4 py-4 ">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                                <div className="p-2 text-sm space-y-3 col-span-1">
                                    <FormField
                                        control={form.control}
                                        name="propertyName"
                                        render={({ field }) => (
                                            <FormItem>                                                <FormLabel>Select statistics object</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value?.toString()} >
                                                    <FormControl >
                                                        <SelectTrigger className='w-full'>
                                                            <SelectValue placeholder="Select statistics object" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className='w-full'>
                                                        {
                                                            propertyNames.map((item, index) => {
                                                                return <SelectItem key={index} value={item}>{item}</SelectItem>
                                                            })
                                                        }
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="p-2 text-sm space-y-3 col-span-1">
                                    <FormField
                                        control={form.control}
                                        name="chartType"
                                        render={({ field }) => (
                                            <FormItem>                                                <FormLabel>Select chart type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value?.toString()} >
                                                    <FormControl >
                                                        <SelectTrigger className='w-full'>
                                                            <SelectValue placeholder="Select chart type" />
                                                        </SelectTrigger>
                                                    </FormControl>                                                    <SelectContent >
                                                        <SelectGroup>
                                                            <SelectLabel>Chart</SelectLabel>
                                                            <SelectItem value={ChartType.BarChartHorizontal.toString()}>Bar-chart(Horizontal)</SelectItem>
                                                            <SelectItem value={ChartType.BarChartVertical.toString()}>Bar-chart(Vertical)</SelectItem>
                                                            <SelectItem value={ChartType.PieChart.toString()}>Pie Chart</SelectItem>
                                                            <SelectItem value={ChartType.RadialChart.toString()}>Radial Chart</SelectItem>
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="p-2 text-sm space-y-3 col-span-1">
                                    <FormField control={form.control} name="title"
                                        render={({ field }) => (
                                            <FormItem>                                                <FormLabel>Enter chart title</FormLabel>
                                                <FormControl>
                                                    <Input type='text' placeholder="Enter chart title" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="p-2 text-sm space-y-3 col-span-1">
                                    <FormField control={form.control} name="size"
                                        render={({ field }) => (
                                            <FormItem>                                                <FormLabel>Enter interface percentage</FormLabel>
                                                <FormControl>
                                                    <Input min={1} max={9} type='number' placeholder="Enter interface percentage" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="p-2 text-sm space-y-3 col-span-1">
                                    <FormField control={form.control} name="firstDescription"
                                        render={({ field }) => (
                                            <FormItem>                                                <FormLabel>Enter first chart description</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Enter first chart description" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="p-2 text-sm space-y-3 col-span-1">
                                    <FormField control={form.control} name="secondDescription"
                                        render={({ field }) => (
                                            <FormItem>                                                <FormLabel>Enter second chart description</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Enter second chart description" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>                        {/* <div className='p-4'>
                            <BarChartHorizontal />
                        </div> */}
                        <SheetFooter>
                            <Button className='mr-4 mb-4'>Preview chart</Button>
                            <Button onClick={() => handleOnSubmit()} >Complete</Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </form>
        </Form >
    )
}
