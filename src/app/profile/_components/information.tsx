import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'
type Props = {
    name: string,
    dob: string,
    address: string,
    gender: string,
    countrySide: string,
    nationalId: string,
    level: string,
    major: string
}

export default function Information({ name, dob, address, gender, countrySide, nationalId, level, major }: Props) {
    return (        <div className='rounded-xl border bg-card text-card-foreground shadow col-span-5 ml-4'>
            <div className='flex flex-col space-y-1.5 p-6'>
                <div className='font-semibold leading-none tracking-tight'>Personal Information</div>
            </div>
            <div className='p-6 pt-0 pl-2'>
                <div className='flex items-center justify-between ml-4'>
                    <div className="grid w-1/3 max-w-sm items-center gap-1.5 p-1">
                        <Label htmlFor="email">Full Name</Label>
                        <Input disabled={true} value={name}/>
                    </div>
                    <div className="grid w-1/3 max-w-sm items-center gap-1.5 p-1">
                        <Label htmlFor="email">Date of Birth</Label>
                        <Input disabled={true} value={dob}/>
                    </div>
                    <div className="grid w-1/3 max-w-sm items-center gap-1.5 p-1">
                        <Label htmlFor="email">Address</Label>
                        <Input disabled={true} value={address}/>
                    </div>
                </div>                <div className='flex items-center justify-between ml-4'>
                    <div className="grid w-1/3 max-w-sm items-center gap-1.5 p-1">
                        <Label htmlFor="email">Gender</Label>
                        <Input disabled={true} value={gender}/>
                    </div>
                    <div className="grid w-1/3 max-w-sm items-center gap-1.5 p-1">
                        <Label htmlFor="email">Hometown</Label>
                        <Input disabled={true} value={countrySide}/>
                    </div>
                    <div className="grid w-1/3 max-w-sm items-center gap-1.5 p-1">
                        <Label htmlFor="email">ID Number</Label>
                        <Input disabled={true} value={nationalId}/>
                    </div>
                </div>
                <div className='flex items-center ml-4'>
                    <div className="grid w-1/3 max-w-sm items-center gap-1.5 p-1">
                        <Label htmlFor="email">Education Level</Label>
                        <Input disabled={true} value={level}/>
                    </div>                    <div className="grid w-1/3 max-w-sm items-center gap-1.5 p-1">
                        <Label htmlFor="email">Major</Label>
                        <Input disabled={true} value={major}/>
                    </div>
                </div>
            </div>
        </div>
    )
}
