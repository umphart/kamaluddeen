// src/services/userService.js
import { supabase } from './supabaseClient';
import toast from 'react-hot-toast';

export const userService = {
  // Check if admin user exists
  async adminExists() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin')
        .single();
      
      return { exists: !!data && !error, error };
    } catch (error) {
      console.error('Error checking admin:', error);
      return { exists: false, error };
    }
  },

  // Create admin user
  async createAdmin(username, password) {
    try {
      // Hash the password (in a real app, use proper hashing like bcrypt)
      // For simplicity, we'll store it as is but in production use proper hashing
      const hashedPassword = password; // In production: await hashPassword(password);
      
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            username,
            password: hashedPassword,
            role: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating admin:', error);
      return { success: false, error };
    }
  },

  // src/services/userService.js - Update createAdmin function
async createAdmin(username, password, role = 'admin') {
  try {
    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return { success: false, error: 'Username already exists' };
    }

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          username,
          password: password, // In production, hash this!
          role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating admin:', error);
    return { success: false, error: error.message };
  }
},
  // Verify user credentials
  async verifyCredentials(username, password) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return { success: false, error: 'Invalid username or password' };
        }
        throw error;
      }

      // Verify password (in production, use proper comparison with hashed password)
      if (data.password === password) {
        // Remove password from returned data
        const { password: _, ...userWithoutPassword } = data;
        return { success: true, user: userWithoutPassword };
      } else {
        return { success: false, error: 'Invalid username or password' };
      }
    } catch (error) {
      console.error('Error verifying credentials:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  },

  // Get all users (admin only)
  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, role, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error getting users:', error);
      return { success: false, error };
    }
  },

  // Update user (admin only)
  async updateUser(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error };
    }
  },

  // Delete user (admin only)
  async deleteUser(userId) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error };
    }
  }
  
};
