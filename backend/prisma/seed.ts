import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create departments
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: 'Human Resources',
        employeeCount: 0
      }
    }),
    prisma.department.create({
      data: {
        name: 'Information Technology',
        employeeCount: 0
      }
    }),
    prisma.department.create({
      data: {
        name: 'Finance',
        employeeCount: 0
      }
    }),
    prisma.department.create({
      data: {
        name: 'Marketing',
        employeeCount: 0
      }
    })
  ]);

  console.log('✅ Departments created');

  // Create positions
  const positions = await Promise.all([
    prisma.position.create({
      data: {
        name: 'HR Manager',
        totalPositionsNeeded: 1,
        currentPositionsFilled: 0,
        departmentId: departments[0].id
      }
    }),
    prisma.position.create({
      data: {
        name: 'Software Developer',
        totalPositionsNeeded: 5,
        currentPositionsFilled: 0,
        departmentId: departments[1].id
      }
    }),
    prisma.position.create({
      data: {
        name: 'Financial Analyst',
        totalPositionsNeeded: 2,
        currentPositionsFilled: 0,
        departmentId: departments[2].id
      }
    }),
    prisma.position.create({
      data: {
        name: 'Marketing Specialist',
        totalPositionsNeeded: 3,
        currentPositionsFilled: 0,
        departmentId: departments[3].id
      }
    })
  ]);

  console.log('✅ Positions created');

  // Create contract types
  const contractTypes = await Promise.all([
    prisma.contractType.create({
      data: {
        name: 'Full-time Permanent',
        description: 'Full-time permanent employment'
      }
    }),
    prisma.contractType.create({
      data: {
        name: 'Part-time',
        description: 'Part-time employment'
      }
    }),
    prisma.contractType.create({
      data: {
        name: 'Contract',
        description: 'Fixed-term contract employment'
      }
    })
  ]);

  console.log('✅ Contract types created');

  // Create allowances
  const allowances = await Promise.all([
    prisma.allowance.create({
      data: {
        name: 'Transportation Allowance',
        amount: 500000,
        description: 'Monthly transportation allowance'
      }
    }),
    prisma.allowance.create({
      data: {
        name: 'Meal Allowance',
        amount: 300000,
        description: 'Daily meal allowance'
      }
    }),
    prisma.allowance.create({
      data: {
        name: 'Phone Allowance',
        amount: 200000,
        description: 'Monthly phone allowance'
      }
    })
  ]);

  console.log('✅ Allowances created');

  // Create insurances
  const insurances = await Promise.all([
    prisma.insurance.create({
      data: {
        name: 'Social Insurance',
        percentage: 8.0,
        description: 'Social insurance contribution'
      }
    }),
    prisma.insurance.create({
      data: {
        name: 'Health Insurance',
        percentage: 1.5,
        description: 'Health insurance contribution'
      }
    }),
    prisma.insurance.create({
      data: {
        name: 'Unemployment Insurance',
        percentage: 1.0,
        description: 'Unemployment insurance contribution'
      }
    })
  ]);

  console.log('✅ Insurances created');

  // Create contract salaries
  const contractSalaries = await Promise.all([
    prisma.contractSalary.create({
      data: {
        baseSalary: 15000000,
        baseInsurance: 1000000,
        requiredDays: 22,
        requiredHours: 176,
        wageDaily: 681818,
        wageHourly: 85227,
        factor: 1.0
      }
    }),
    prisma.contractSalary.create({
      data: {
        baseSalary: 25000000,
        baseInsurance: 1500000,
        requiredDays: 22,
        requiredHours: 176,
        wageDaily: 1136364,
        wageHourly: 142045,
        factor: 1.2
      }
    })
  ]);

  console.log('✅ Contract salaries created');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@hrms.com',
      password: hashedPassword,
      role: 'ADMIN',
      employee: {
        create: {
          name: 'System Administrator',
          email: 'admin@hrms.com',
          phoneNumber: '+84123456789',
          address: 'Ho Chi Minh City, Vietnam',
          gender: true,
          positionId: positions[0].id,
          departmentId: departments[0].id,
          typeContract: 2
        }
      }
    },
    include: {
      employee: true
    }
  });

  console.log('✅ Admin user created');

  // Create sample employees
  const employeeUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@hrms.com',
        password: await bcrypt.hash('password123', 12),
        role: 'FULLTIME',
        employee: {
          create: {
            name: 'John Doe',
            email: 'john.doe@hrms.com',
            phoneNumber: '+84987654321',
            address: 'District 1, Ho Chi Minh City',
            gender: true,
            dateOfBirth: new Date('1990-05-15'),
            age: 34,
            positionId: positions[1].id,
            departmentId: departments[1].id,
            typeContract: 2
          }
        }
      },
      include: { employee: true }
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@hrms.com',
        password: await bcrypt.hash('password123', 12),
        role: 'PARTIME',
        employee: {
          create: {
            name: 'Jane Smith',
            email: 'jane.smith@hrms.com',
            phoneNumber: '+84901234567',
            address: 'District 3, Ho Chi Minh City',
            gender: false,
            dateOfBirth: new Date('1992-08-22'),
            age: 32,
            positionId: positions[3].id,
            departmentId: departments[3].id,
            typeContract: 1
          }
        }
      },
      include: { employee: true }
    })
  ]);

  console.log('✅ Sample employees created');

  // Create contracts for employees
  for (const user of [adminUser, ...employeeUsers]) {
    if (user.employee) {
      await prisma.contract.create({
        data: {
          employeeId: user.employee.id,
          contractSalaryId: contractSalaries[0].id,
          contractTypeId: contractTypes[user.employee.typeContract === 1 ? 1 : 0].id,
          departmentId: user.employee.departmentId!,
          positionId: user.employee.positionId!,
          startDate: new Date(),
          contractStatus: 'VALID',
          typeContract: user.employee.typeContract === 1 ? 'PARTIME' : 'FULLTIME'
        }
      });
    }
  }

  console.log('✅ Contracts created');

  // Update employee counts in departments
  for (const department of departments) {
    const employeeCount = await prisma.employee.count({
      where: { departmentId: department.id }
    });
    
    await prisma.department.update({
      where: { id: department.id },
      data: { employeeCount }
    });
  }

  console.log('✅ Department employee counts updated');

  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('📧 Admin credentials:');
  console.log('   Email: admin@hrms.com');
  console.log('   Password: admin123');
  console.log('');
  console.log('📧 Sample employee credentials:');
  console.log('   Email: john.doe@hrms.com (Fulltime)');
  console.log('   Password: password123');
  console.log('   Email: jane.smith@hrms.com (Partime)');
  console.log('   Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
