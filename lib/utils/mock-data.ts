import { Mandant } from "@/types";

/**
 * Mock client (Mandanten) data for demonstration
 * This simulates a client database for the RAG system
 */
export const MOCK_MANDANTEN: Mandant[] = [
  {
    id: "m1",
    name: "Müller GmbH",
    type: "GmbH",
    deadlines: [
      {
        id: "d1",
        date: "2025-01-10",
        task: "Umsatzsteuer-Voranmeldung Dezember 2024",
        priority: "high",
        status: "open",
      },
      {
        id: "d2",
        date: "2025-02-28",
        task: "Jahresabschluss 2024",
        priority: "high",
        status: "open",
      },
      {
        id: "d3",
        date: "2025-03-15",
        task: "Körperschaftsteuererklärung 2023",
        priority: "medium",
        status: "open",
      },
    ],
  },
  {
    id: "m2",
    name: "Schmidt Consulting",
    type: "Freiberufler",
    deadlines: [
      {
        id: "d4",
        date: "2025-01-15",
        task: "Umsatzsteuer-Voranmeldung Q4 2024",
        priority: "medium",
        status: "open",
      },
      {
        id: "d5",
        date: "2025-07-31",
        task: "Einkommensteuererklärung 2024",
        priority: "medium",
        status: "open",
      },
    ],
  },
  {
    id: "m3",
    name: "Weber Bau AG",
    type: "AG",
    deadlines: [
      {
        id: "d6",
        date: "2025-01-10",
        task: "Lohnsteuer-Anmeldung Dezember 2024",
        priority: "high",
        status: "open",
      },
      {
        id: "d7",
        date: "2025-03-31",
        task: "Jahresabschluss 2024 mit Prüfung",
        priority: "high",
        status: "open",
      },
      {
        id: "d8",
        date: "2025-02-15",
        task: "Betriebsprüfung - Unterlagen vorbereiten",
        priority: "high",
        status: "open",
      },
    ],
  },
  {
    id: "m4",
    name: "Fischer Einzelhandel",
    type: "Einzelunternehmen",
    deadlines: [
      {
        id: "d9",
        date: "2025-01-10",
        task: "Umsatzsteuer-Voranmeldung Dezember 2024",
        priority: "medium",
        status: "open",
      },
      {
        id: "d10",
        date: "2025-07-31",
        task: "Einkommensteuererklärung 2024",
        priority: "medium",
        status: "open",
      },
      {
        id: "d11",
        date: "2025-05-31",
        task: "Gewerbesteuererklärung 2024",
        priority: "low",
        status: "open",
      },
    ],
  },
  {
    id: "m5",
    name: "Becker & Partner GbR",
    type: "GmbH",
    deadlines: [
      {
        id: "d12",
        date: "2025-02-10",
        task: "Feststellungserklärung 2024",
        priority: "medium",
        status: "open",
      },
      {
        id: "d13",
        date: "2025-07-31",
        task: "Einkommensteuererklärungen Gesellschafter",
        priority: "medium",
        status: "open",
      },
    ],
  },
];

/**
 * Get all open deadlines across all clients
 */
export function getAllOpenDeadlines() {
  const allDeadlines = MOCK_MANDANTEN.flatMap((mandant) =>
    mandant.deadlines
      .filter((d) => d.status === "open")
      .map((deadline) => ({
        ...deadline,
        mandantName: mandant.name,
        mandantType: mandant.type,
      }))
  );

  // Sort by date (earliest first)
  return allDeadlines.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

/**
 * Get deadlines for a specific client
 */
export function getDeadlinesForMandant(mandantId: string) {
  const mandant = MOCK_MANDANTEN.find((m) => m.id === mandantId);
  return mandant?.deadlines.filter((d) => d.status === "open") || [];
}

/**
 * Search clients by name
 */
export function searchMandanten(query: string): Mandant[] {
  const lowerQuery = query.toLowerCase();
  return MOCK_MANDANTEN.filter((mandant) =>
    mandant.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get summary statistics
 */
export function getMandantenStats() {
  const totalMandanten = MOCK_MANDANTEN.length;
  const totalDeadlines = MOCK_MANDANTEN.reduce(
    (sum, m) => sum + m.deadlines.filter((d) => d.status === "open").length,
    0
  );
  const highPriorityDeadlines = MOCK_MANDANTEN.reduce(
    (sum, m) =>
      sum +
      m.deadlines.filter((d) => d.status === "open" && d.priority === "high")
        .length,
    0
  );

  return {
    totalMandanten,
    totalDeadlines,
    highPriorityDeadlines,
  };
}
