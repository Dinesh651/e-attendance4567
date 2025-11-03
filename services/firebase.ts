import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase, ref, get, set, push, remove, child } from "firebase/database";
import { User, Role } from "../types";


// Your web app's Firebase configuration from your project
const firebaseConfig = {
  apiKey: "AIzaSyAorD9R4FiSq6M1MeJwFukkO3Leu7q6F7o",
  authDomain: "cozey-8ad64.firebaseapp.com",
  databaseURL: "https://cozey-8ad64.firebaseio.com",
  projectId: "cozey-8ad64",
  storageBucket: "cozey-8ad64.appspot.com",
  messagingSenderId: "841803166613",
  appId: "1:841803166613:web:154d11830d7ef9144f3c9c",
  measurementId: "G-94BYMYTS85"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getDatabase(app);


export const findUserByEmailInDB = async (email: string): Promise<User | null> => {
  const dbRef = ref(db);
  const normalizedEmail = email.toLowerCase();

  // Check admins by fetching all and filtering client-side
  const adminsSnapshot = await get(child(dbRef, 'admins'));
  if (adminsSnapshot.exists()) {
    const adminsData = adminsSnapshot.val();
    const adminId = Object.keys(adminsData).find(key => adminsData[key].email.toLowerCase() === normalizedEmail);
    if (adminId) {
      const adminUser = adminsData[adminId];
      return { id: adminId, name: adminUser.name, email: adminUser.email, role: Role.ADMIN };
    }
  }

  // Check employees by fetching all and filtering client-side
  const employeesSnapshot = await get(child(dbRef, 'employees'));
  if (employeesSnapshot.exists()) {
    const employeesData = employeesSnapshot.val();
    const employeeId = Object.keys(employeesData).find(key => employeesData[key].email.toLowerCase() === normalizedEmail);
    if (employeeId) {
      const employeeUser = employeesData[employeeId];
      return { id: employeeId, name: employeeUser.name, email: employeeUser.email, role: Role.EMPLOYEE };
    }
  }

  return null;
};

export const getEmployeesFromDB = async (): Promise<User[]> => {
    const employeesRef = ref(db, 'employees');
    const snapshot = await get(employeesRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({
            id: key,
            name: data[key].name,
            email: data[key].email,
            role: Role.EMPLOYEE,
        }));
    }
    return [];
};

export const addEmployeeToDB = async (name: string, email: string): Promise<User> => {
    const employeesRef = ref(db, 'employees');
    const newEmployeeRef = push(employeesRef);
    const newEmployeeData = { name, email: email.toLowerCase() };
    await set(newEmployeeRef, newEmployeeData);
    return { id: newEmployeeRef.key!, ...newEmployeeData, role: Role.EMPLOYEE };
};


export const removeEmployeeFromDB = async (employeeId: string): Promise<void> => {
    const employeeRef = ref(db, `employees/${employeeId}`);
    await remove(employeeRef);
};
