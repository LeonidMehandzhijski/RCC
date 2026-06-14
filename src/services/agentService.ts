// src/services/agentService.ts
import { db } from '../firebase';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import type { Agent } from '../types/scheduler.types';

/**
 * Subscribes to real-time updates from the 'Agents' collection.
 * @param callback - Function to execute with the array of agents whenever data changes.
 * @returns A function to unsubscribe from the listener.
 */
export const subscribeToAgents = (callback: (agents: Agent[]) => void): (() => void) => {
  const agentsCollectionRef = collection(db, 'Agents');
  return onSnapshot(agentsCollectionRef, (snapshot) => {
    console.log(`Agent snapshot update: ${snapshot.docs.length} agents`);
    const agentsData = snapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      // Ensure all fields of Agent are correctly mapped and typed
      return {
        id: docSnapshot.id,
        name: data.ImePrezime || data.name || 'Unknown Agent', // Consistent naming
        avatar: data.avatar, // Assuming avatar might exist
        ImePrezime: data.ImePrezime,
        isOnBreak: data.isOnBreak || false,
        shiftStart: data.shiftStart || undefined,
        shiftEnd: data.shiftEnd || undefined,
        currentBreakStartTime: data.currentBreakStartTime || undefined,
        currentBreakId: data.currentBreakId || undefined,
        currentShiftId: data.currentShiftId || undefined,
        assignedBreaks: data.assignedBreaks || [],
        activeBreak_StartTime: data.activeBreak_StartTime || undefined,
        activeBreak_ScheduledBreakId: data.activeBreak_ScheduledBreakId || undefined,
        totalBreakDurationToday: data.totalBreakDurationToday || undefined
      } as Agent; // Cast to Agent, ensure all fields match the type definition
    });
    console.log("Updated agents in subscription:", agentsData);
    callback(agentsData);
  });
};

/**
 * Fetches all agents from the 'Agents' collection once.
 * @returns A promise that resolves to an array of Agent objects.
 */
export const getAgents = async (): Promise<Agent[]> => {
  try {
    console.log("Fetching agents from Firebase collection 'Agents'");
    const snapshot = await getDocs(collection(db, 'Agents'));
    console.log(`Found ${snapshot.size} agent documents in Firestore`);

    if (snapshot.empty) {
      console.log("No agents found in 'Agents' collection. Returning empty list.");
      return [];
    }

    const agentsData = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      const agent: Agent = {
        id: docSnap.id,
        name: data.ImePrezime || data.name || 'Unknown Agent',
        ImePrezime: data.ImePrezime,
        isOnBreak: data.isOnBreak || false,
        shiftStart: data.shiftStart,
        shiftEnd: data.shiftEnd,
        currentBreakStartTime: data.currentBreakStartTime,
        currentBreakId: data.currentBreakId,
        currentShiftId: data.currentShiftId,
        assignedBreaks: data.assignedBreaks || [],
        // Ensure all other expected fields from Agent type are mapped
      };
      console.log(`Mapped agent from Firestore:`, agent);
      return agent;
    });
    console.log(`Successfully mapped ${agentsData.length} agents`);
    return agentsData;
  } catch (error) {
    console.error("Error fetching agents:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    return [];
  }
};

/**
 * Updates the status of a specific agent.
 * @param agentId - The ID of the agent to update.
 * @param isOnBreak - Boolean indicating if the agent is on break.
 * @param breakStartTime - Optional Date object for when the break started.
 */
export const updateAgentStatus = async (
  agentId: string,
  isOnBreak: boolean,
  breakStartTime?: Date,
  currentBreakId?: string | null
): Promise<void> => {
  const agentRef = doc(db, 'Agents', agentId);
  const updateData: Partial<Agent> = {
    isOnBreak,
  };

  if (isOnBreak && breakStartTime) {
    updateData.currentBreakStartTime = breakStartTime ? Timestamp.fromDate(breakStartTime) : undefined;
    updateData.currentBreakId = currentBreakId || undefined;
  } else if (!isOnBreak) {
    updateData.currentBreakStartTime = undefined;
    updateData.currentBreakId = undefined;
  }

  await updateDoc(agentRef, updateData);
  console.log(`Agent ${agentId} status updated: isOnBreak=${isOnBreak}`);
};
