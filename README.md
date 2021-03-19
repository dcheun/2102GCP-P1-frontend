# Expense Reimbursement System - Frontend

## Project Description

The Expense Reimbursement System (ERS) manages the process of reimbursing employees for expenses incurred while on company time. All employees in the company can login and submit requests for reimbursement and view their past tickets and pending requests.

Finance managers can log in and view all reimbursement requests and past history for all employees in the company. Finance managers are authorized to approve and deny requests for expense reimbursement.

This is the frontend repository. The backend is in a separate repository.

## Technologies Used

- HTML
- CSS
- JavaScript (vanilla)
- JWT - JSON Web Token
- GCP Storage Bucket (hosting for the static site)

## Features

Employees and managers can login and be redirected to a role based portal. Upon successful login, the user will be given a JWT which will be used for further requests to the backend API that requires authentication. The home page is a dashboard that features a table listing all of their expenses.

The main table can be sorted on the following columns:
- Employee Name
- Submitted At
- Status

The search bar provides search/filter capabilities on all of the columns.

From here, the user can switch to a "statistics" view by clicking on the dropdown menu from their avatar on the top navbar. The user can also logout from this dropdown menu, which will delete the JWT. Once the JWT is deleted, the user will need to login again to access the dashboard.

Valid expense statuses are:
- Pending
- Approved
- Denied

To-do wish list:
- Add upload file functionality
- Add ability to create/register new users

## Getting Started

Requirements:
- An IDE such as VS Code if you want to view the code.
- You will need to know the login accounts for an employee/manager beforehand.

### Clone Repository
```
git clone https://github.com/dcheun/2102GCP-P1-frontend.git
```

### Run
Simply open index.html on a web browser. Alternatively, host the static site on a cloud service such as GCP, AWS, Github pages, etc.

## Usage

On first run, the user will be presented with a login page. Enter login credentials to enter the role based dashboard. See features section for more details on what can be done after logging in. Once the user is complete with their expense tasks, click the user avatar, and on the dropdown menu, click *Logout* to be taken back to the login page.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
