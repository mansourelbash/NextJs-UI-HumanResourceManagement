/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import dashboardApiRequest from "@/apis/dashboard.api";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import departmentApiRequest from "@/apis/department.api";
import employeeApiRequest from "@/apis/employee.api";
import contractApiRequest from "@/apis/contract.api";
import AppBreadcrumb, { PathItem } from "@/components/custom/_breadcrumb";
import { useQuery } from "@tanstack/react-query";
import { Employee } from "@/data/schema/employee.schema";
import { ApiResponse } from "@/data/type/response.type";
import { DepartmentUserCount } from "@/data/schema/department.schema";
import { LabelList, Pie, PieChart, Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Contract, TypeContract } from "@/data/schema/contract.schema";

type DynamicChartConfig = {
  [key: string]: {
    label: string;
    color?: string; // Color is optional for fixed items
  };
};


//react query key
const QUERY_KEY = {
  employee: "employees",
  department: "departments",
  position: "positions",
  contract: "contracts",
  employeeCountKey: "employee-count-by-base-salary",
  jobCountKey: "job-posting-count",
  applicantCountKey: "applicant-count",
  applicantCountByPositionKey: "applicant-count-by-position",
  leaveApplicationKey: "leave-applications-today",
  advanceCountKey: "advances-by-pay-period"
}

const pathList: Array<PathItem> = [
  {
    name: "",
    url: ""
  },
];

export default function Dashboard() {
  const { data: employeeData, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEY.employee],
    queryFn: () => employeeApiRequest.getList(),
    select: (data: ApiResponse<Employee[]>) => data.metadata || [], // Get all employee data
  });
  const MasterCount = employeeData?.filter(employee => employee.level === "Thạc sĩ").length || 0;
  const BachelorCount = employeeData?.filter(employee => employee.level === "Đại học").length || 0;
  const DoctorateCount = employeeData?.filter(employee => employee.level === "Tiến sĩ").length || 0;
  const EngineerCount = employeeData?.filter(employee => employee.level === "Kỹ sư").length || 0;
  const maleCount = employeeData?.filter(employee => employee.gender === true).length || 0;
  const femaleCount = employeeData?.filter(employee => employee.gender === false).length || 0;
  const totalEmployees = employeeData?.length || 0;
  //range tuổi
  const under25Count = employeeData?.filter(employee => employee.age !== undefined && employee.age < 25).length || 0;
  const from25to34Count = employeeData?.filter(employee => employee.age !== undefined && employee.age >= 25 && employee.age <= 34).length || 0;
  const from35to44Count = employeeData?.filter(employee => employee.age !== undefined && employee.age >= 35 && employee.age <= 44).length || 0;
  const from45to54Count = employeeData?.filter(employee => employee.age !== undefined && employee.age >= 45 && employee.age <= 54).length || 0;
  const over55Count = employeeData?.filter(employee => employee.age !== undefined && employee.age > 55).length || 0;
  //range thâm niên 
  const under1YearCount = employeeData?.filter(employee => employee.tenure !== undefined && employee.tenure < 1).length;
  const from1to3YearsCount = employeeData?.filter(employee => employee.tenure !== undefined && employee.tenure >= 1 && employee.tenure <= 3).length;
  const from4to7YearsCount = employeeData?.filter(employee => employee.tenure !== undefined && employee.tenure >= 4 && employee.tenure <= 7).length;
  const from8to10YearsCount = employeeData?.filter(employee => employee.tenure !== undefined && employee.tenure >= 8 && employee.tenure <= 10).length;
  const over10YearsCount = employeeData?.filter(employee => employee.tenure !== undefined && employee.tenure > 10).length;

  const { data: departmentData } = useQuery({
    queryKey: [QUERY_KEY.department],
    queryFn: () => departmentApiRequest.getEmployeeCountByDepartment(),
    select: (data: ApiResponse<DepartmentUserCount[]>) => data.metadata || [],
  });
  const totalDepartment = departmentData?.length;

  const { data: contractData } = useQuery({
    queryKey: [QUERY_KEY.contract],
    queryFn: () => contractApiRequest.getList(),
    select: (data: ApiResponse<Contract[]>) => data.metadata || [],
  });
  const fullTimeCount = contractData?.filter(
    (contract) => contract.typeContract === TypeContract.Fulltime
  ).length;
  const partTimeCount = contractData?.filter(
    (contract) => contract.typeContract === TypeContract.Partime
  ).length;

  const chartData = [
    { gender: "male", count: maleCount, fill: "var(--color-male)" },
    { gender: "female", count: femaleCount, fill: "var(--color-female)" },
  ];
  const contractChartData = [
    { employeeType: "fulltime", countContractLabel: fullTimeCount, fill: "var(--color-fulltime)" },
    { employeeType: "partime", countContractLabel: partTimeCount, fill: "var(--color-partime)" },
  ];
  const levelChartData = [
    { level: "master", count: MasterCount, fill: "var(--color-master)" },
    { level: "bachelor", count: BachelorCount, fill: "var(--color-bachelor)" },
    { level: "doctorate", count: DoctorateCount, fill: "var(--color-doctorate)" },
    { level: "engineer", count: EngineerCount, fill: "var(--color-engineer)" },
  ]
  const ageRangeChartData = [
    { age: "<25", count: under25Count, fill: "hsl(var(--chart-1))" },
    { age: "25-34", count: from25to34Count, fill: "hsl(var(--chart-2))" },
    { age: "35-34", count: from35to44Count, fill: "hsl(var(--chart-3))" },
    { age: "45-54", count: from45to54Count, fill: "hsl(var(--chart-4))" },
    { age: ">55", count: over55Count, fill: "hsl(var(--chart-5))" },
  ]
  const tenureRangeChartData = [
    { year: "<1", count: under1YearCount, fill: "hsl(var(--chart-1))" },
    { year: "1-3", count: from1to3YearsCount, fill: "hsl(var(--chart-2))" },
    { year: "4-7", count: from4to7YearsCount, fill: "hsl(var(--chart-3))" },
    { year: "8-10", count: from8to10YearsCount, fill: "hsl(var(--chart-4))" },
    { year: ">10", count: over10YearsCount, fill: "hsl(var(--chart-5))" },
  ]
  const departmentChartData = departmentData?.map(department => ({
    id: department.id,
    name: department.name,
    count: department.employeeCount,   // Employee count
    fill: `var(--color-${department.id})`, // Dynamic color based on department ID
  }));

  const chartConfig = {
    count: {
      label: "Number of employees",
    },    countContractLabel: {
      label: "Number of Contracts",
    },
    male: {
      label: "Male",
      color: "hsl(var(--chart-1))", // Change color if needed
    },
    female: {
      label: "Female",
      color: "hsl(var(--chart-2))", // Change color if needed
    },
    fulltime: {
      label: "Full-time",
      color: "hsl(var(--chart-3))",
    },
    partime: {
      label: "Part-time",
      color: "hsl(var(--chart-4))",
    },    master: {
      label: "Master's Degree",
      color: "hsl(var(--chart-1))",
    },
    doctorate: {
      label: "Doctorate",
      color: "hsl(var(--chart-2))",
    },
    engineer: {
      label: "Engineer",
      color: "hsl(var(--chart-3))",
    },
    bachelor: {
      label: "Bachelor's Degree",
      color: "hsl(var(--chart-4))",
    },    applicant:{
      label: "Number of Applications"
    }
  } satisfies ChartConfig

  // Add dynamic department configurations
  const chartConfigDepartment: DynamicChartConfig= {    
    count: {
    label: "Number of employees",
  },}
  departmentData?.forEach(department => {
    chartConfigDepartment[department.id] = {
      label: department.name,
      color: `hsl(var(--chart-${department.id}))`, // Dynamic color based on department ID
    };
  });

  //Get contracts before expiring date 30 days
    //#region 
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    const [selectedDate, setSelectedDate] = useState<string>(formattedDate);
    const [startDate, setStartDate] = useState<string>(formattedDate);
    const [endDate, setEndDate] = useState<string>(formattedDate);
    const [change, setChange] = useState<number>(0)
    //#endregion

    //Employee count by base salary
    //#region 
    const { data: employeeCountData} = useQuery({
        queryKey: [QUERY_KEY.employeeCountKey],
        queryFn: () => dashboardApiRequest.getEmployeeCountByBaseSalary()
    })
  const chartApplicantPosition : DynamicChartConfig={
    count: {
      label: "Number of Applications: ",
      
    }}

    const employeeCountListData = employeeCountData?.metadata?.map(item => ({
        baseSalary: item.baseSalary,
        count: item.count,
        fill: `hsl(var(--chart-1))`
    })) || [];

    const { data: applicationByPositionData} = useQuery({
        queryKey: [QUERY_KEY.applicantCountByPositionKey],
        queryFn: () => dashboardApiRequest.getApplicantCountByPosition()
    })
    const applicantCountListData = applicationByPositionData?.metadata?.map(item => ({
        positionName: item.name,
        count: item.count,
        color: "hsl(var(--chart-1))"
    }))
    //#endregion

    //Count job posting, applicant, advances
    //#region 
    const { data: jobCountData} = useQuery({
        queryKey: [QUERY_KEY.jobCountKey],
        queryFn: () => dashboardApiRequest.getJobPostingCount()
    })

    const { data: applicantCountData} = useQuery({
        queryKey: [QUERY_KEY.applicantCountKey],
        queryFn: () => dashboardApiRequest.getApplicantCount()
    })

    const { data: advanceCountData, isLoading: advanceCountLoading } = useQuery({
        queryKey: [QUERY_KEY.advanceCountKey],
        queryFn: () => dashboardApiRequest.getAdvanceCountByPeriod(startDate, endDate)
    })
    //#endregion

    //leave application, expiring contracts
    //#region 
    const { data: leaveApplicationData, isLoading: leaveApplicationLoading } = useQuery({
        queryKey: [QUERY_KEY.leaveApplicationKey],
        queryFn: () => dashboardApiRequest.getLeaveApplicationsToday()
    });


    const { data: expiringContractData, isLoading: expiringContractLoading } = useQuery({
        queryKey: [QUERY_KEY.leaveApplicationKey, change],
        queryFn: () => dashboardApiRequest.getExpiringContracts(selectedDate)
    })
    //#endregion

    //get date change
    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedDate(event.target.value);
  };

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setStartDate(event.target.value);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setEndDate(event.target.value);
  };

  return (
    <div className="space-y-5">
      <div className='flex items-center justify-between space-y-2'>        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Dashboard</h2>
          <AppBreadcrumb pathList={pathList} className="mt-2" />
        </div>
      </div>

      {/* Statistics Count */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5"> 
        {isLoading ? (
          <p>Loading data...</p>
        ) : isError ? (
          <p>An error occurred while loading data</p>
        ) : (
          <>
            <Card>                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Number of Employees
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{
                        totalEmployees ?? 0
                    }</div>
                    <p className="text-xs text-muted-foreground">
                        number of employees in the company
                    </p>
                </CardContent>
            </Card>

            <Card>                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Number of Departments
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{
                        totalDepartment ?? 0
                    }</div>
                    <p className="text-xs text-muted-foreground">
                        number of departments currently available
                    </p>
                </CardContent>
            </Card>

            <Card>                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Number of Positions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{
                        totalDepartment ?? 0
                    }</div>
                    <p className="text-xs text-muted-foreground">
                        current positions in the company
                    </p>
                </CardContent>
            </Card>            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Number of Job Postings
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{
                        jobCountData?.metadata ?? 0
                    }</div>
                    <p className="text-xs text-muted-foreground">
                        total recruitment posts published
                    </p>
                </CardContent>
            </Card>            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                    Number of Applications
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{
                        applicantCountData?.metadata ?? 0
                    }</div>
                    <p className="text-xs text-muted-foreground">
                        total job applications received
                    </p>
                </CardContent>
            </Card>
          </>
        )}
      </div>      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Gender Ratio</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[250px] [&_.recharts-text]:fill-background"
            >
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="count" hideLabel />}
                />
                <Pie data={chartData} dataKey="count">
                  <LabelList
                    dataKey="gender"
                    className="fill-background"
                    stroke="none"
                    fontSize={12}
                    formatter={(value: keyof typeof chartConfig) =>
                      chartConfig[value]?.label
                    }
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="leading-none text-muted-foreground">
              Number of Employees by Gender
            </div>
          </CardFooter>
        </Card>        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Full-time/Part-time Contracts</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[250px] [&_.recharts-text]:fill-background"
            >
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="countContractLabel" hideLabel />}
                />
                <Pie data={contractChartData} dataKey="countContractLabel">
                  <LabelList
                    dataKey="employeeType"
                    className="fill-background"
                    stroke="none"
                    fontSize={12}
                    formatter={(value: keyof typeof chartConfig) =>
                      chartConfig[value]?.label
                    }
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>          <CardFooter className="flex-col gap-2 text-sm">
            <div className="leading-none text-muted-foreground">
             Number of Contracts by Type: Fulltime - Partime
            </div>
          </CardFooter>
        </Card>        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Education Level Statistics</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[250px] [&_.recharts-text]:fill-background"
            >
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="count" hideLabel />}
                />
                <Pie data={levelChartData} dataKey="count">
                  <LabelList
                    dataKey="level"
                    className="fill-background"
                    stroke="none"
                    fontSize={12}
                    formatter={(value: keyof typeof chartConfig) =>
                      chartConfig[value]?.label
                    }
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="leading-none text-muted-foreground">
              Number of Employees by Education Level
            </div>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>
              Salary Advance Requests This Period
            </CardTitle>
          </CardHeader>
          <br />
          <CardContent>
            <div>              <div style={{ marginBottom: '20px' }}>
                <label>
                  Start Date: <span></span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={handleStartDateChange}
                  />
                </label>
                <label>
                  End Date:
                  <input
                    type="date"
                    value={endDate}
                    onChange={handleEndDateChange}
                  />
                </label>
              </div>              {advanceCountLoading ? (
                <p>Loading...</p>
              ) : (
                <div>
                  <p>Number of Advance Requests: {advanceCountData&&advanceCountData!.metadata}</p>
                </div>
              )}              <button 
                onClick={() => setChange(change + 1)} 
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200 w-full mt-4">
                Display Information
              </button>
            </div>               
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between space-x-4">
          <Card className="w-1/2">
              <CardHeader>
                  <CardTitle>Employees by Department</CardTitle>
              </CardHeader>
              <CardContent>
                  <ChartContainer config={chartConfigDepartment}>
                      <BarChart
                          accessibilityLayer
                          data={departmentChartData}
                          layout="vertical"
                          margin={{
                              left: 200,
                          }}
                      >
                          <CartesianGrid horizontal={false} />
                          <YAxis
                              dataKey="name"
                              type="category"
                              tickLine={false}
                              tickMargin={10}
                              axisLine={false}
                              hide
                          />
                          <XAxis dataKey="count" type="number" hide />
                          <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent indicator="line" />}
                          />
                          <Bar
                              dataKey="count"
                              layout="vertical"
                              fill="var(--color-desktop)"
                              radius={4}
                          >
                              <LabelList
                                  width={300}
                                  dataKey="name"
                                  position="left"
                                  offset={8}
                                  className="fill-[--color-label]"
                                  fontSize={12}
                              />
                              <LabelList
                                  dataKey="count"
                                  position="right"
                                  offset={8}
                                  className="fill-foreground"
                                  fontSize={12}
                              />
                          </Bar>
                      </BarChart>
                  </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-sm">
                  <div className="leading-none text-muted-foreground">
                      Display Number of Employees by Department
                  </div>
              </CardFooter>
          </Card>

          <Card className="w-1/2">              <CardHeader>
                  <CardTitle>Applications by Position</CardTitle>
              </CardHeader>
              <CardContent>
                  <ChartContainer config={chartApplicantPosition}>
                      <BarChart
                          accessibilityLayer
                          data={applicantCountListData}
                          layout="vertical"
                          margin={{
                              left: -20,
                          }}
                      >
                          <XAxis type="number" dataKey="count" hide />
                          <YAxis
                              dataKey="positionName"
                              type="category"
                              tickLine={false}
                              tickMargin={10}
                              axisLine={false}
                              tickFormatter={(value) => value.slice(0, 40)}
                              width={200}
                          />
                          <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent hideLabel />}
                          />
                          <Bar 
                              dataKey="count" 
                              fill="hsl(var(--chart-1))" 
                              radius={5} 
                              barSize={20}
                          >
                              <LabelList
                                  dataKey="count"
                                  position="right"
                                  offset={8}
                                  className="fill-foreground"
                                  fontSize={12}
                              />
                          </Bar>
                      </BarChart>
                  </ChartContainer>
              </CardContent>              <CardFooter className="flex-col items-start gap-2 text-sm">
                  <div className="leading-none text-muted-foreground">
                      Display Most Applied Positions
                  </div>
              </CardFooter>
          </Card>
      </div>
      
      <div className="flex flex-wrap gap-4">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Employees by Age Range</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart
                accessibilityLayer
                data={ageRangeChartData}
                margin={{
                  top: 20,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="age"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 6)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="count" fill="var(--color-desktop)" radius={8}>
                  <LabelList
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="leading-none text-muted-foreground">
              Display Number of Employees by Age Range
            </div>
          </CardFooter>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Employees by Years of Service</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart
                accessibilityLayer
                data={tenureRangeChartData}
                margin={{
                  top: 20,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="year"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 6)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="count" fill="var(--color-desktop)" radius={8}>
                  <LabelList
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="leading-none text-muted-foreground">
              Display the number of employees by years of service.
            </div>
          </CardFooter>
        </Card>
      </div>

      <div>
        <Card>
            <CardHeader>
                <CardTitle>Number of Employees by Base Salary Range</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer  config={chartConfig}>
                    <BarChart
                        accessibilityLayer
                        data={employeeCountListData}
                        margin={{
                            top: 20,
                        }}
                        height={10}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="baseSalary"
                            tickLine={false}
                            tickMargin={5}
                            axisLine={false}
                            tickFormatter={(value) => String(value).slice(0, 9)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={8} barSize={40}>
                            <LabelList
                                position="top"
                                offset={12}
                                className="fill-foreground"
                                fontSize={12}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="leading-none text-muted-foreground">
                    Display Number of Employees by Base Salary Levels
                </div>
            </CardFooter>
        </Card>
      </div>

      <div>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>
                      List of Leave Applications Today
                  </CardTitle>
              </CardHeader>
              <Table>              <TableHeader>
                      <TableRow>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead className="text-center">Reason for Leave</TableHead>
                      <TableHead className="text-center">Response</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {
                          leaveApplicationLoading ? <></> :
                          leaveApplicationData&&leaveApplicationData!.metadata?.map((item, index) => {
                                  return <TableRow key={index}>
                                  <TableCell className="font-medium">{item.statusLeave}</TableCell>
                                  <TableCell className="font-medium">{item.employeeId}</TableCell>
                                  <TableCell className="font-medium">{item.description}</TableCell>
                                  <TableCell className="font-medium">{item.replyMessage}</TableCell>
                                  </TableRow>
                              })
                      }
                  </TableBody>
              </Table>
          </Card>
      </div>
      
      <div>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>
                      List of contracts expiring soon
                  </CardTitle>
              </CardHeader>
              <CardContent>                  <label>
                      Contract expiration date: <span></span>
                      <input
                          type="date"
                          value={selectedDate}
                          onChange={handleDateChange}
                      />
                  </label>
                  <span style={{ margin: '0 20px' }}></span>
                  <Button onClick={() => setChange(change + 1)}>Get List</Button>
              </CardContent>
              
              <Table>
                  <TableCaption>List of Contracts Expiring Within 30 Days</TableCaption>                  <TableHeader>
                      <TableRow>
                      <TableHead className="w-[150px]">Contract ID</TableHead>
                      <TableHead>Employee Name</TableHead>
                      <TableHead className="text-center">Start Date</TableHead>
                      <TableHead className="text-center">End Date</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {
                          expiringContractLoading ? <></> :
                          expiringContractData&&expiringContractData!.metadata?.map((item, index) => {
                              return <TableRow key={index}>
                              <TableCell >{item.id}</TableCell>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>{item.startDate}</TableCell>
                              <TableCell >{item.endDate}</TableCell>
                              </TableRow>
                          })
                      }
                  </TableBody>
                  </Table>

          </Card>
          
      </div>
    </div>
  );
};