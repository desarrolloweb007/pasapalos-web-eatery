
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, Lock, Save, Edit } from 'lucide-react';

export const UserUsuarios = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        full_name: userProfile.full_name || ''
      }));
    }
  }, [userProfile]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: formData.full_name
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido actualizada correctamente",
      });
      
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas nuevas no coinciden",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) throw error;

      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido cambiada correctamente",
      });
      
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: "No se pudo cambiar la contraseña",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-orange-500" />
            <span>Información Personal</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
                Nombre Completo
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                disabled={!editing}
                className="mt-1 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Correo Electrónico
              </Label>
              <div className="mt-1 flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{user?.email}</span>
                <span className="text-xs text-gray-400">(No modificable)</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            {!editing ? (
              <Button
                onClick={() => setEditing(true)}
                variant="outline"
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => {
                    setEditing(false);
                    if (userProfile) {
                      setFormData(prev => ({
                        ...prev,
                        full_name: userProfile.full_name || ''
                      }));
                    }
                  }}
                  variant="outline"
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-orange-500" />
            <span>Cambiar Contraseña</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
                Contraseña Actual
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="mt-1 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                placeholder="Ingresa tu contraseña actual"
              />
            </div>
            
            <div>
              <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                Nueva Contraseña
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="mt-1 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirmar Nueva Contraseña
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="mt-1 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                placeholder="Repite la nueva contraseña"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleChangePassword}
              disabled={loading || !formData.newPassword || !formData.confirmPassword}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Lock className="h-4 w-4 mr-2" />
              {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card className="bg-orange-50 border-orange-200">
        <CardHeader>
          <CardTitle className="text-orange-800">Información de la Cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-orange-700 font-medium">Rol:</span>
              <p className="text-orange-600 capitalize">{userProfile?.role_name || 'Usuario'}</p>
            </div>
            <div>
              <span className="text-orange-700 font-medium">ID de Usuario:</span>
              <p className="text-orange-600 font-mono text-xs">{user?.id.substring(0, 8)}...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
