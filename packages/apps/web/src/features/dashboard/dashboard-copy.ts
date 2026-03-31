import { getRuntimeLanguage } from '../../shared/i18n/runtime';

const dashboardCopyByLanguage = {
  en: {
    common: {
      requestFailed: 'Request failed. Please try again.',
      saveChanges: 'Save changes',
      cancel: 'Cancel',
      confirmAction: 'Confirm',
    },
    header: {
      title: 'Task Dashboard',
      signedInAs: 'Signed in as',
      signOut: 'Sign out',
    },
    tasks: {
      sectionTitle: 'Tasks',
      listView: 'List',
      kanbanView: 'Kanban',
      timelineView: 'Timeline',
      newTask: 'New task',
      refreshing: 'Refreshing...',
      noEmployees: 'No employees available. Please create an employee first.',
      create: 'Create task',
      edit: 'Edit',
      delete: 'Delete',
      overdue: 'Overdue',
      duePrefix: 'Due:',
      subtasksPrefix: 'Subtasks:',
      donePrefix: 'Done:',
      createdToastTitle: 'Task created',
      updatedToastTitle: 'Task updated',
      updatedToastDescription: 'Your changes have been saved.',
      deletedToastTitle: 'Task deleted',
      createdToastDescription: (title: string): string => `"${title}" has been created.`,
      deletedToastDescription: (title: string): string => `"${title}" has been deleted.`,
      confirmDeleteTitle: 'Delete task',
      confirmDelete: (title: string): string => `Delete task "${title}"?`,
      editHeading: (taskId: number | string): string => `Edit task #${taskId}`,
      missingContext: 'Task context is missing.',
      validations: {
        titleRequired: 'Title is required.',
        startDateRequired: 'Start date is required.',
        assigneeRequired: 'Assignee is required.',
        subtaskInvalid: 'Each subtask requires a title and start date.',
      },
    },
    subtasks: {
      title: 'Subtasks',
      noSubtasks: 'No subtasks yet.',
      addPlaceholder: 'Add subtask...',
      add: 'Add',
      addSubtask: 'Add subtask',
      noSubtasksAdded: 'No subtasks added.',
      titlePlaceholder: 'Subtask title',
      remove: 'Remove',
      start: 'Subtask start',
      end: 'Subtask end',
      assignedTo: 'Assigned to',
      unassigned: 'Unassigned',
      completed: 'Completed',
      removeAria: (title: string): string => `Remove subtask ${title}`,
    },
    employees: {
      workspaceControls: 'Workspace Controls',
      filterDescription: 'Filter the board by assigned employee.',
      noEmployees: 'No employees available yet. Please create one first.',
      refreshData: 'Refresh data',
      managementTitle: 'Employee management',
      addEmployee: 'Add employee',
      createEmployee: 'Create employee',
      editEmployee: 'Edit employee',
      edit: 'Edit',
      removeEmployee: 'Remove',
      employeeFilter: 'Employee filter',
      allEmployees: 'All employees',
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      role: 'Role',
      department: 'Department',
      noEmployeesYet: 'No employees yet.',
      createdToastTitle: 'Employee created',
      updatedToastTitle: 'Employee updated',
      deletedToastTitle: 'Employee deleted',
      createdToastDescription: (employeeName: string): string => `${employeeName} has been created.`,
      updatedToastDescription: (employeeName: string): string => `${employeeName} has been saved.`,
      deletedToastDescription: (employeeName: string): string => `${employeeName} has been deleted.`,
      confirmDeleteTitle: 'Delete employee',
      confirmDelete: (employeeName: string): string => `Delete employee "${employeeName}"?`,
      editAria: (employeeName: string): string => `Edit employee ${employeeName}`,
      removeAria: (employeeName: string): string => `Remove employee ${employeeName}`,
      validations: {
        firstNameRequired: 'First name is required.',
        lastNameRequired: 'Last name is required.',
        emailRequired: 'Email is required.',
      },
    },
  },
  de: {
    common: {
      requestFailed: 'Anfrage fehlgeschlagen. Bitte erneut versuchen.',
      saveChanges: 'Änderungen speichern',
      cancel: 'Abbrechen',
      confirmAction: 'Bestätigen',
    },
    header: {
      title: 'Aufgaben-Dashboard',
      signedInAs: 'Angemeldet als',
      signOut: 'Abmelden',
    },
    tasks: {
      sectionTitle: 'Aufgaben',
      listView: 'Liste',
      kanbanView: 'Kanban',
      timelineView: 'Timeline',
      newTask: 'Neue Aufgabe',
      refreshing: 'Aktualisiere...',
      noEmployees: 'Keine Mitarbeitenden vorhanden. Bitte zuerst eine Person anlegen.',
      create: 'Aufgabe erstellen',
      edit: 'Bearbeiten',
      delete: 'Löschen',
      overdue: 'Überfällig',
      duePrefix: 'Fällig:',
      subtasksPrefix: 'Unteraufgaben:',
      donePrefix: 'Erledigt:',
      createdToastTitle: 'Aufgabe erstellt',
      updatedToastTitle: 'Aufgabe aktualisiert',
      updatedToastDescription: 'Die Änderungen wurden gespeichert.',
      deletedToastTitle: 'Aufgabe gelöscht',
      createdToastDescription: (title: string): string => `"${title}" wurde erstellt.`,
      deletedToastDescription: (title: string): string => `"${title}" wurde gelöscht.`,
      confirmDeleteTitle: 'Aufgabe löschen',
      confirmDelete: (title: string): string => `Aufgabe "${title}" löschen?`,
      editHeading: (taskId: number | string): string => `Aufgabe #${taskId} bearbeiten`,
      missingContext: 'Aufgabenkontext fehlt.',
      validations: {
        titleRequired: 'Titel ist erforderlich.',
        startDateRequired: 'Startdatum ist erforderlich.',
        assigneeRequired: 'Zuweisung ist erforderlich.',
        subtaskInvalid: 'Jede Unteraufgabe benötigt einen Titel und ein Startdatum.',
      },
    },
    subtasks: {
      title: 'Unteraufgaben',
      noSubtasks: 'Noch keine Unteraufgaben.',
      addPlaceholder: 'Unteraufgabe hinzufügen...',
      add: 'Hinzufügen',
      addSubtask: 'Unteraufgabe hinzufügen',
      noSubtasksAdded: 'Keine Unteraufgaben hinzugefügt.',
      titlePlaceholder: 'Titel der Unteraufgabe',
      remove: 'Entfernen',
      start: 'Start Unteraufgabe',
      end: 'Ende Unteraufgabe',
      assignedTo: 'Zugewiesen an',
      unassigned: 'Nicht zugewiesen',
      completed: 'Erledigt',
      removeAria: (title: string): string => `Unteraufgabe ${title} entfernen`,
    },
    employees: {
      workspaceControls: 'Workspace-Steuerung',
      filterDescription: 'Board nach zugewiesener Person filtern.',
      noEmployees: 'Noch keine Mitarbeitenden vorhanden. Bitte zuerst eine Person anlegen.',
      refreshData: 'Daten aktualisieren',
      managementTitle: 'Mitarbeiterverwaltung',
      addEmployee: 'Mitarbeiter hinzufügen',
      createEmployee: 'Mitarbeiter erstellen',
      editEmployee: 'Mitarbeiter bearbeiten',
      edit: 'Bearbeiten',
      removeEmployee: 'Entfernen',
      employeeFilter: 'Mitarbeiterfilter',
      allEmployees: 'Alle Mitarbeitenden',
      firstName: 'Vorname',
      lastName: 'Nachname',
      email: 'E-Mail',
      role: 'Rolle',
      department: 'Abteilung',
      noEmployeesYet: 'Noch keine Mitarbeitenden.',
      createdToastTitle: 'Mitarbeiter erstellt',
      updatedToastTitle: 'Mitarbeiter aktualisiert',
      deletedToastTitle: 'Mitarbeiter gelöscht',
      createdToastDescription: (employeeName: string): string => `${employeeName} wurde erstellt.`,
      updatedToastDescription: (employeeName: string): string => `${employeeName} wurde gespeichert.`,
      deletedToastDescription: (employeeName: string): string => `${employeeName} wurde gelöscht.`,
      confirmDeleteTitle: 'Mitarbeiter löschen',
      confirmDelete: (employeeName: string): string => `Mitarbeiter "${employeeName}" löschen?`,
      editAria: (employeeName: string): string => `Mitarbeiter ${employeeName} bearbeiten`,
      removeAria: (employeeName: string): string => `Mitarbeiter ${employeeName} entfernen`,
      validations: {
        firstNameRequired: 'Vorname ist erforderlich.',
        lastNameRequired: 'Nachname ist erforderlich.',
        emailRequired: 'E-Mail ist erforderlich.',
      },
    },
  },
} as const;

type DashboardCopy = (typeof dashboardCopyByLanguage)['en'];

const getLocalizedDashboardCopy = (): DashboardCopy => <DashboardCopy>dashboardCopyByLanguage[getRuntimeLanguage()];

const resolveValue = (path: PropertyKey[]): unknown => {
  let current: unknown = getLocalizedDashboardCopy();
  for (const segment of path) {
    if (!current || typeof current !== 'object') {
      return undefined;
    }

    current = (current as Record<PropertyKey, unknown>)[segment];
  }

  return current;
};

const createDynamicProxy = (path: PropertyKey[]): unknown =>
  new Proxy(() => undefined, {
    get: (_target, property) => {
      const value = resolveValue([...path, property]);
      if (typeof value === 'function') {
        return value;
      }

      if (value && typeof value === 'object') {
        return createDynamicProxy([...path, property]);
      }

      return value;
    },
    apply: (_target, _thisArg, argumentList) => {
      const value = resolveValue(path);
      if (typeof value !== 'function') {
        return undefined;
      }

      return value(...argumentList);
    },
  });

export const dashboardCopy = createDynamicProxy([]) as DashboardCopy;
