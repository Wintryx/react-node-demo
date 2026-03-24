export interface paths {
    "/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Login user
         * @description Authenticates user credentials and returns an access token.
         */
        post: operations["AuthController_login"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Logout user
         * @description Clears refresh token cookie and invalidates the persisted refresh token for the current session.
         */
        post: operations["AuthController_logout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Refresh access token
         * @description Uses the HttpOnly refresh token cookie to issue a new JWT access token without re-entering credentials.
         */
        post: operations["AuthController_refresh"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Register user
         * @description Creates a new user account and returns an access token.
         */
        post: operations["AuthController_register"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/employees": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List employees
         * @description Returns all employees sorted by creation order. Demo scope: authenticated users share one global workspace (no per-user ownership isolation).
         */
        get: operations["EmployeesController_listEmployees"];
        put?: never;
        /**
         * Create employee
         * @description Creates a new employee with a unique email address. Demo scope: authenticated users share one global workspace (no per-user ownership isolation).
         */
        post: operations["EmployeesController_createEmployee"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/employees/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Delete employee
         * @description Deletes an employee if no tasks are currently assigned. Demo scope: authenticated users share one global workspace (no per-user ownership isolation).
         */
        delete: operations["EmployeesController_deleteEmployee"];
        options?: never;
        head?: never;
        /**
         * Update employee
         * @description Updates one or more fields of an existing employee. Demo scope: authenticated users share one global workspace (no per-user ownership isolation).
         */
        patch: operations["EmployeesController_updateEmployee"];
        trace?: never;
    };
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Health check
         * @description Returns the service status and the response timestamp.
         */
        get: operations["AppController_getHealth"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tasks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List tasks
         * @description Returns all tasks or filters tasks by employee id. Demo scope: authenticated users share one global workspace (no per-user ownership isolation).
         */
        get: operations["TasksController_listTasks"];
        put?: never;
        /**
         * Create task
         * @description Creates a task for an employee, including optional subtasks and subtask assignees. Demo scope: authenticated users share one global workspace (no per-user ownership isolation).
         */
        post: operations["TasksController_createTask"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tasks/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Delete task
         * @description Deletes a task and all of its subtasks. Demo scope: authenticated users share one global workspace (no per-user ownership isolation).
         */
        delete: operations["TasksController_deleteTask"];
        options?: never;
        head?: never;
        /**
         * Update task
         * @description Updates task fields and replaces the full subtask list when provided. Demo scope: authenticated users share one global workspace (no per-user ownership isolation).
         */
        patch: operations["TasksController_updateTask"];
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        AuthResponseDto: {
            /** @description JWT access token used in the Authorization header. */
            accessToken: string;
            /**
             * @description Access token validity duration.
             * @example 15m
             */
            expiresIn: string;
            /**
             * @description Token type for Authorization header usage.
             * @example Bearer
             */
            tokenType: string;
            /** @description Authenticated user information. */
            user: components["schemas"]["AuthResponseUserDto"];
        };
        AuthResponseUserDto: {
            /**
             * Format: date-time
             * @description ISO-8601 timestamp when the user account was created.
             * @example 2026-03-16T10:20:30.000Z
             */
            createdAt: string;
            /**
             * @description Email address of the authenticated user.
             * @example candidate@example.com
             */
            email: string;
            /**
             * @description Unique identifier of the authenticated user.
             * @example 1
             */
            id: number;
        };
        CreateEmployeeDto: {
            /**
             * @description Department the employee belongs to.
             * @example engineering
             * @enum {string}
             */
            department: "engineering" | "product" | "design" | "qa" | "operations" | "people";
            /**
             * @description Unique company email address of the employee.
             * @example arne.winter@example.com
             */
            email: string;
            /**
             * @description First name of the employee.
             * @example Arne
             */
            firstName: string;
            /**
             * @description Last name of the employee.
             * @example Winter
             */
            lastName: string;
            /**
             * @description Role of the employee within the organization.
             * @example developer
             * @enum {string}
             */
            role: "developer" | "team-lead" | "engineering-manager" | "product-manager" | "designer" | "qa-engineer" | "devops-engineer";
        };
        CreateTaskDto: {
            /**
             * @description Detailed task description.
             * @example Implement all requested task management flows.
             */
            description?: string;
            /**
             * Format: date-time
             * @description ISO-8601 due date of the task.
             * @example 2026-03-25T17:00:00.000Z
             */
            dueDate?: string;
            /**
             * @description Employee id that owns the task.
             * @example 1
             */
            employeeId: number;
            /**
             * @description Task priority. Defaults to "medium" when omitted.
             * @example medium
             * @enum {string}
             */
            priority?: "low" | "medium" | "high";
            /**
             * Format: date-time
             * @description ISO-8601 start date of the task.
             * @example 2026-03-16T08:00:00.000Z
             */
            startDate: string;
            /**
             * @description Task status. Defaults to "todo" when omitted.
             * @example todo
             * @enum {string}
             */
            status?: "todo" | "in-progress" | "done";
            /** @description Optional list of subtasks to create with this task. */
            subtasks?: components["schemas"]["UpsertSubtaskDto"][];
            /**
             * @description Short task title.
             * @example Build employee board
             */
            title: string;
        };
        EmployeeResponseDto: {
            /**
             * Format: date-time
             * @description ISO-8601 timestamp when the employee was created.
             * @example 2026-03-16T10:20:30.000Z
             */
            createdAt: string;
            /**
             * @description Department the employee belongs to.
             * @example engineering
             * @enum {string}
             */
            department: "engineering" | "product" | "design" | "qa" | "operations" | "people";
            /**
             * @description Unique company email address of the employee.
             * @example arne.winter@example.com
             */
            email: string;
            /**
             * @description First name of the employee.
             * @example Arne
             */
            firstName: string;
            /**
             * @description Unique identifier of the employee.
             * @example 1
             */
            id: number;
            /**
             * @description Last name of the employee.
             * @example Winter
             */
            lastName: string;
            /**
             * @description Role of the employee within the organization.
             * @example developer
             * @enum {string}
             */
            role: "developer" | "team-lead" | "engineering-manager" | "product-manager" | "designer" | "qa-engineer" | "devops-engineer";
        };
        HealthResponseDto: {
            /**
             * @description Current service health status.
             * @example ok
             * @enum {string}
             */
            status: "ok";
            /**
             * Format: date-time
             * @description ISO-8601 timestamp when the health response was generated.
             * @example 2026-03-16T10:20:30.000Z
             */
            timestamp: string;
        };
        LoginDto: {
            /**
             * @description User email used for authentication.
             * @example candidate@example.com
             */
            email: string;
            /**
             * @description Plain text password for the user account.
             * @example StrongPassword!1
             */
            password: string;
        };
        RegisterDto: {
            /**
             * @description Email address for the new user account.
             * @example candidate@example.com
             */
            email: string;
            /**
             * @description Account password. Must include uppercase, lowercase, number, and special character.
             * @example StrongPassword!1
             */
            password: string;
        };
        SubtaskAssigneeResponseDto: {
            /**
             * @description Unique identifier of the assignee employee.
             * @example 123
             */
            id: number;
            /**
             * @description Display name of the assignee employee.
             * @example Arne Winter
             */
            name: string;
        };
        SubtaskResponseDto: {
            /** @description Assigned employee for the subtask or null. */
            assignee: components["schemas"]["SubtaskAssigneeResponseDto"] | null;
            /**
             * @description Completion flag of the subtask.
             * @example false
             */
            completed: boolean;
            /**
             * Format: date-time
             * @description ISO-8601 end date of the subtask or null if open-ended.
             * @example 2026-03-17T18:00:00.000Z
             */
            endDate: Record<string, never> | null;
            /**
             * @description Unique identifier of the subtask.
             * @example 10
             */
            id: number;
            /**
             * Format: date-time
             * @description ISO-8601 start date of the subtask.
             * @example 2026-03-16T08:00:00.000Z
             */
            startDate: string;
            /**
             * @description Short subtask title.
             * @example Prepare API contract
             */
            title: string;
        };
        TaskResponseDto: {
            /**
             * Format: date-time
             * @description ISO-8601 timestamp when the task was created.
             * @example 2026-03-16T10:20:30.000Z
             */
            createdAt: string;
            /**
             * @description Detailed task description, null when not provided.
             * @example Implement all requested task management flows.
             */
            description: Record<string, never> | null;
            /**
             * Format: date-time
             * @description ISO-8601 due date of the task or null.
             * @example 2026-03-25T17:00:00.000Z
             */
            dueDate: Record<string, never> | null;
            /**
             * @description Identifier of the employee owning the task.
             * @example 1
             */
            employeeId: number;
            /**
             * @description Unique identifier of the task.
             * @example 1
             */
            id: number;
            /**
             * @description Priority level of the task.
             * @example medium
             * @enum {string}
             */
            priority: "low" | "medium" | "high";
            /**
             * Format: date-time
             * @description ISO-8601 start date of the task.
             * @example 2026-03-16T08:00:00.000Z
             */
            startDate: string;
            /**
             * @description Current status of the task.
             * @example todo
             * @enum {string}
             */
            status: "todo" | "in-progress" | "done";
            /** @description List of subtasks belonging to this task. */
            subtasks: components["schemas"]["SubtaskResponseDto"][];
            /**
             * @description Short task title.
             * @example Build employee board
             */
            title: string;
        };
        UpdateEmployeeDto: {
            /**
             * @description Department the employee belongs to.
             * @example engineering
             * @enum {string}
             */
            department?: "engineering" | "product" | "design" | "qa" | "operations" | "people";
            /**
             * @description Unique company email address of the employee.
             * @example arne.winter@example.com
             */
            email?: string;
            /**
             * @description First name of the employee.
             * @example Arne
             */
            firstName?: string;
            /**
             * @description Last name of the employee.
             * @example Winter
             */
            lastName?: string;
            /**
             * @description Role of the employee within the organization.
             * @example developer
             * @enum {string}
             */
            role?: "developer" | "team-lead" | "engineering-manager" | "product-manager" | "designer" | "qa-engineer" | "devops-engineer";
        };
        UpdateTaskDto: {
            /**
             * @description Updated task description.
             * @example Implement all requested task management flows.
             */
            description?: string;
            /**
             * Format: date-time
             * @description Updated ISO-8601 due date.
             * @example 2026-03-25T17:00:00.000Z
             */
            dueDate?: string;
            /**
             * @description Updated employee id that owns the task.
             * @example 1
             */
            employeeId?: number;
            /**
             * @description Updated task priority.
             * @example high
             * @enum {string}
             */
            priority?: "low" | "medium" | "high";
            /**
             * Format: date-time
             * @description Updated ISO-8601 start date.
             * @example 2026-03-16T08:00:00.000Z
             */
            startDate?: string;
            /**
             * @description Updated task status.
             * @example in-progress
             * @enum {string}
             */
            status?: "todo" | "in-progress" | "done";
            /** @description Full subtask list replacement. Existing subtasks omitted from this array will be removed. */
            subtasks?: components["schemas"]["UpsertSubtaskDto"][];
            /**
             * @description Updated task title.
             * @example Build employee board
             */
            title?: string;
        };
        UpsertSubtaskDto: {
            /**
             * @description Employee id assigned to this subtask.
             * @example 123
             */
            assigneeId?: number;
            /**
             * @description Completion flag. Defaults to false when omitted for new subtasks.
             * @example false
             */
            completed?: boolean;
            /**
             * Format: date-time
             * @description ISO-8601 end date of the subtask.
             * @example 2026-03-17T18:00:00.000Z
             */
            endDate?: string;
            /**
             * @description Existing subtask id for updates. Omit to create a new subtask.
             * @example 1
             */
            id?: number;
            /**
             * Format: date-time
             * @description ISO-8601 start date of the subtask.
             * @example 2026-03-16T08:00:00.000Z
             */
            startDate: string;
            /**
             * @description Short subtask title.
             * @example Prepare API contract
             */
            title: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    AuthController_login: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Login payload. */
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginDto"];
            };
        };
        responses: {
            /** @description Authenticates user credentials and returns a JWT access token. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthResponseDto"];
                };
            };
            /** @description Validation failed for the request body. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid email or password. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many login attempts. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_logout: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Logout completed and refresh token cookie cleared. */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many logout attempts. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_refresh: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Returns a new access token for a valid refresh token cookie. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthResponseDto"];
                };
            };
            /** @description Refresh token is missing or invalid. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many refresh attempts. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_register: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Registration payload. */
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegisterDto"];
            };
        };
        responses: {
            /** @description Registers a user and returns a JWT access token. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthResponseDto"];
                };
            };
            /** @description Validation failed for the request body. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description A user with the given email already exists. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many register attempts. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    EmployeesController_listEmployees: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Employees returned successfully. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EmployeeResponseDto"][];
                };
            };
            /** @description Missing or invalid bearer token. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    EmployeesController_createEmployee: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Employee creation payload. */
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateEmployeeDto"];
            };
        };
        responses: {
            /** @description Employee created successfully. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EmployeeResponseDto"];
                };
            };
            /** @description Validation failed for the request body. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid bearer token. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description An employee with the given email already exists. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    EmployeesController_deleteEmployee: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Employee id. */
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Deletes an employee. */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid employee id. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid bearer token. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Employee not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Employee has assigned tasks and cannot be deleted. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    EmployeesController_updateEmployee: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Employee id. */
                id: number;
            };
            cookie?: never;
        };
        /** @description Employee update payload (partial update supported). */
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateEmployeeDto"];
            };
        };
        responses: {
            /** @description Employee updated successfully. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EmployeeResponseDto"];
                };
            };
            /** @description Invalid employee id or invalid request body. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid bearer token. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Employee not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description An employee with the given email already exists. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AppController_getHealth: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Health check completed successfully. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthResponseDto"];
                };
            };
        };
    };
    TasksController_listTasks: {
        parameters: {
            query?: {
                /** @description Optional employee id to filter tasks. */
                employeeId?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Tasks returned successfully. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskResponseDto"][];
                };
            };
            /** @description Invalid query parameter "employeeId". */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid bearer token. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TasksController_createTask: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Task creation payload. */
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateTaskDto"];
            };
        };
        responses: {
            /** @description Task created successfully. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskResponseDto"];
                };
            };
            /** @description Validation failed or invalid task date ranges. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid bearer token. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Referenced employee or one or more subtask assignees were not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TasksController_deleteTask: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Task id. */
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Deletes a task (subtasks are deleted as well). */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid task id. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid bearer token. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Task not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TasksController_updateTask: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Task id. */
                id: number;
            };
            cookie?: never;
        };
        /** @description Task update payload (partial update supported). */
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateTaskDto"];
            };
        };
        responses: {
            /** @description Task updated successfully. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskResponseDto"];
                };
            };
            /** @description Invalid task id, validation failed, or invalid subtask ownership/date range. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid bearer token. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Task, referenced employee, or one or more subtask assignees were not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
}
