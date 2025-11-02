# Finance Tracker

A comprehensive financial management web application built with Next.js, featuring bank statement processing, transaction tracking, and multi-account aggregation capabilities.

## Project Overview

Finance Tracker is a full-stack web application that helps users manage their finances by:

- **Bank Statement Processing**: Upload and process bank statements from multiple banks (Handelsbanken, Inter, Amex, SJ Prio)
- **Transaction Management**: View, categorize, and analyze financial transactions
- **Multi-Account Aggregation**: Consolidate data from multiple accounts and directories
- **Email Integration**: Merge and process email exports
- **Family Sharing**: Share financial data with family members
- **Recurrent Transactions**: Track and manage recurring expenses
- **Real-time Updates**: Automatic aggregation and data synchronization

## Technology Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Package Manager**: pnpm

## Directory Structure

```
finance-tracker/
├── app/                      # Next.js app directory (routes & pages)
│   ├── actions/             # Server actions
│   ├── api/                 # API routes
│   ├── auth/                # Authentication pages
│   ├── components/          # Page-specific components
│   ├── amex/                # Amex bank integration
│   ├── handelsbanken/       # Handelsbanken bank integration
│   ├── inter/               # Inter bank integration
│   ├── inter-account/       # Inter account management
│   ├── sjprio/              # SJ Prio integration
│   ├── family/              # Family sharing features
│   ├── recurrent/           # Recurrent transactions
│   ├── email-client/        # Email client integration
│   ├── email-merge/         # Email merging tools
│   ├── global/              # Global views
│   └── types/               # TypeScript type definitions
├── components/              # Shared React components
│   └── ui/                  # shadcn/ui components
├── lib/                     # Utility libraries
│   ├── supabaseClient.ts    # Supabase client configuration
│   ├── utils.ts             # General utilities
│   └── hooks/               # Custom React hooks
├── context/                 # React context providers
├── config/                  # shadcn/ui configuration
│   └── components.json      # shadcn/ui component config
├── scripts/                 # Utility scripts
│   ├── check-table.js       # Database table verification
│   ├── merge-gmail-exports.js # Email export merger
│   └── scan-functions.js    # Code analysis tools
├── Documentation/           # Project documentation
├── reports/                 # Generated reports
├── tests/                   # Test files
└── public/                  # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Supabase account and project

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/carlosvelosos/finance-tracker.git
   cd finance-tracker
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**

   Run the SQL scripts to create necessary tables and functions. See [Documentation/sql_code.md](Documentation/sql_code.md) for details.

### Running the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Building for Production

```bash
pnpm build
pnpm start
```

## Key Features

### Bank Integration

- Upload CSV bank statements
- Automatic transaction parsing and categorization
- Support for multiple banks and formats

### Data Aggregation

- Consolidate transactions across multiple accounts
- Directory-based organization
- Real-time aggregation updates

### Email Tools

- Merge multiple email exports
- Process email data for analysis

### Family Sharing

- Share transaction data with family members
- Multi-user access control

## Documentation

Comprehensive documentation is available in the `Documentation/` directory:

- **[User Guide](Documentation/webapp-user-guide.md)** - Complete application usage guide
- **[Bank Statement Upload](Documentation/bank_statement_to_supabase.md)** - How to process bank statements
- **[Inter BR Account Integration](Documentation/inter-br-account-integration.md)** - Inter Brazil account setup
- **[Email Merge Tool](Documentation/email-merge-tool.md)** - Email export merging
- **[SQL Documentation](Documentation/sql_code.md)** - Database schema and functions
- **[RPC Functions](Documentation/rpc-function-explanation.md)** - Supabase RPC functions
- **[Security Review](Documentation/SECURITY_REVIEW.md)** - Security considerations
- **[Testing Plan](Documentation/TESTING_PLAN.md)** - Testing strategy

### Development Documentation

- [Code Refactoring Summary](Documentation/CODE_REFACTORING_SUMMARY.md)
- [Multi-Directory Features](Documentation/MULTI_DIRECTORY_FEATURES.md)
- [Error Handling Improvements](Documentation/error-handling-improvements.md)
- [Table Discovery Setup](Documentation/table-discovery-setup.md)

## Scripts

Utility scripts are available in the `scripts/` directory:

```bash
# Check database table structure
node scripts/check-table.js

# Merge Gmail exports
node scripts/merge-gmail-exports.js

# Scan codebase for functions
node scripts/scan-functions.js
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Deployment

The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## License

This project is private and proprietary.

## Support

For questions or issues, please refer to the [Documentation](Documentation/) or create an issue in the repository.

## New branch

```bash
git checkout -b design/badge-count-improvements
```
