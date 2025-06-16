import { Button } from "@/components/custom/button";
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CRUD_MODE } from "@/data/const";
import { leaveApplicationSchema, StatusLeave, leaveApplicationDefault, leaveApplication } from "@/data/schema/leaveApplication.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { AlertDialogDescription } from "@/components/ui/alert-dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import leaveApplicationApiRequest from "@/apis/leaveApplication.api";
import { handleErrorApi, handleSuccessApi } from "@/lib/utils";
import { useCurrentUser } from "@/app/system/ui/auth-context";
import { Role } from "@/data/schema/auth.schema";

type FormProps = {
    openCRUD: boolean,
    mode: CRUD_MODE,
    setOpenCRUD: (openCRUD: boolean) => void,
    size?: number,
    detail: leaveApplication
}

const QUERY_KEY = {
    keyList: "leave-application",
    keySub: "time-keeping"
}

export default function FormCRUD(props: FormProps) {
    const { openCRUD, setOpenCRUD, size = 600, mode, detail } = props;
    const [isDisabled, setIsDisabled] = useState<boolean>(false);
    const { currentUser } = useCurrentUser();
    const isAdmin = currentUser?.role === Role.Admin;

    const queryClient = useQueryClient();

    const addDataMutation = useMutation({
        mutationFn: (body: leaveApplication) => leaveApplicationApiRequest.create(body),
        onSuccess: (data) => {
            if (data.isSuccess) {
                queryClient.invalidateQueries({ queryKey: [QUERY_KEY.keyList] });
                handleSuccessApi({ message: "Inserted Successfully!" });
                setOpenCRUD(false);
            } else {
                handleErrorApi({ error: data.message });
            }
        }
    });

    const updateDataMutation = useMutation({
        mutationFn: ({ id, body }: { id: number, body: leaveApplication }) => leaveApplicationApiRequest.update(id, body),
        onSuccess: (data) => {
            if (data.isSuccess) {
                queryClient.invalidateQueries({ queryKey: [QUERY_KEY.keyList] });
                handleSuccessApi({ message: "Updated Successfully!" });
                setOpenCRUD(false);
            } else {
                handleErrorApi({ error: data.message });
            }
        }
    });

    const deleteDataMutation = useMutation({
        mutationFn: (id: number) => leaveApplicationApiRequest.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY.keyList] });
            handleSuccessApi({ message: "Deleted Successfully!" });
            setOpenCRUD(false);
        }
    });

    const listDataEmployeeQuery = useQuery({
        queryKey: [QUERY_KEY.keySub],
        queryFn: () => leaveApplicationApiRequest.getAllEmployee(),
        staleTime: 5000
    });

    const form = useForm<leaveApplication>({        resolver: zodResolver(leaveApplicationSchema),
        defaultValues: mode === CRUD_MODE.ADD ? {
            ...leaveApplicationDefault,
            statusLeave: StatusLeave.Draft
        } : leaveApplicationDefault,
    });
      const onSubmit = (data: leaveApplication) => {
        // For new leave applications by regular users, always set status to Draft
        if (!isAdmin) {
            // Regular users can only submit in Draft status, whether adding or editing
            if (mode === CRUD_MODE.ADD || mode === CRUD_MODE.EDIT) {
                data.statusLeave = StatusLeave.Draft;
            }
        }
    
        if (mode === CRUD_MODE.ADD) {
            addDataMutation.mutate(data);
        } else if (mode === CRUD_MODE.EDIT) {
            updateDataMutation.mutate({ id: detail.id ?? 0, body: data });
        } else if (mode === CRUD_MODE.DELETE) {
            deleteDataMutation.mutate(data.id ?? 0);
        }
    }

    const handleCloseForm = (e: any) => {
        e.preventDefault();
        setOpenCRUD(false);
    };

    useEffect(() => {
        if (Object.keys(detail).length > 0) {
            form.reset(detail);
        }
        // Regular users can only view in VIEW mode, Admins can also edit status in EDIT mode
        const statusDisabled = mode === CRUD_MODE.VIEW || (mode === CRUD_MODE.EDIT && !isAdmin);
        setIsDisabled(mode === CRUD_MODE.VIEW);
    }, [detail, mode, openCRUD, isAdmin]);

    return (
        <div>
            <AlertDialog open={openCRUD} onOpenChange={setOpenCRUD}>
                {mode !== CRUD_MODE.DELETE ? (
                    <AlertDialogContent className={`gap-0 top-[50%] border-none overflow-hidden p-0 sm:min-w-[500px] sm:max-w-[${size}px] !sm:w-[${size}px] sm:rounded-[0.3rem]`}>                        <AlertDialogHeader className='flex justify-between align-middle p-2 py-1 bg-primary'>
                            <AlertDialogTitle className="text-slate-50">
                                {mode === CRUD_MODE.ADD 
                                    ? (isAdmin ? "Add Leave Request" : "Request Leave") 
                                    : "Edit Leave Request"}
                                {!isAdmin && mode === CRUD_MODE.ADD && (
                                    <span className="block text-xs text-slate-200 mt-1">Will be submitted as Draft for approval</span>
                                )}
                            </AlertDialogTitle>
                        </AlertDialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
                                <div className="p-2 text-sm space-y-3">
                                <FormField control={form.control} name="employeeId"
                                    render={({ field }) => (
                                        <FormItem>                                            <FormLabel>Employee</FormLabel>
                                            <FormControl>
                                                <Select
                                                    {...field}
                                                    value={field.value?.toString()}
                                                    onValueChange={field.onChange}
                                                    disabled={isDisabled}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select employee" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {listDataEmployeeQuery.data?.metadata?.map((item) => (
                                                            <SelectItem key={item.id} value={item.id.toString()}>
                                                                <div>
                                                                    <p>{item.Name}</p>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />  

                                    <FormField control={form.control} name="timeLeave"
                                        render={({ field }) => (
                                            <FormItem>                                <FormLabel>Leave Duration</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="Enter leave duration" {...field} disabled={isDisabled} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField control={form.control} name="description"
                                        render={({ field }) => (
                                            <FormItem>                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter description"
                                                        {...field}
                                                        value={field.value ?? ''}
                                                        disabled={isDisabled}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />                                    {/* Only show status field for admins in any mode, or for regular users in VIEW mode */}
                                    {(isAdmin || mode === CRUD_MODE.VIEW) && (
                                        <FormField control={form.control} name="statusLeave"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Status</FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            {...field}
                                                            value={field.value?.toString()}
                                                            onValueChange={(value) => {
                                                                const enumValue = parseInt(value);
                                                                field.onChange(enumValue);
                                                            }}
                                                            disabled={isDisabled || (mode === CRUD_MODE.EDIT && !isAdmin)}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value={StatusLeave.Draft.toString()}>Draft</SelectItem>
                                                                {isAdmin && (
                                                                    <>
                                                                        <SelectItem value={StatusLeave.Approved.toString()}>Approved</SelectItem>
                                                                        <SelectItem value={StatusLeave.Refuse.toString()}>Refuse</SelectItem>
                                                                    </>
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </div>                                <AlertDialogFooter className="p-2 py-1 bg-secondary/80">
                                    <Button onClick={handleCloseForm} className="bg-gray-400 hover:bg-red-500" size='sm'>Cancel</Button>
                                    {(mode === CRUD_MODE.ADD || mode === CRUD_MODE.EDIT) &&
                                        <Button type="submit" size='sm'>Save</Button>}
                                </AlertDialogFooter>
                            </form>
                        </Form>
                    </AlertDialogContent>
                ) : (                    <AlertDialogContent className={`gap-0 top-[50%] border-none overflow-hidden p-0 w-[400px] sm:rounded-[0.3rem]`}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogDescription className="text-center pb-4 text-lg text-stone-700">
                            Are you sure you want to delete this leave request?
                        </AlertDialogDescription>
                        <AlertDialogFooter className="!justify-center p-2 py-3 text-center">
                            <Button onClick={handleCloseForm} className="bg-gray-400 hover:bg-red-500" size='sm'>Cancel</Button>
                            <Button className="" size='sm' onClick={() => onSubmit(detail)}>Delete</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                )}
            </AlertDialog>
        </div>
    );
}