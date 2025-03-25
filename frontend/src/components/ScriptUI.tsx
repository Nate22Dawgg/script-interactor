
import { useState } from 'react';
import { UIComponent, Parameter } from '../lib/types';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { ArrowRight, Plus, Trash2, Settings, Edit, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ScriptUIProps {
  components: UIComponent[] | undefined;
  parameters: Parameter[] | undefined;
  onParametersChange?: (params: Record<string, any>) => void;
  onExecute?: () => void;
  onEdit?: (components: UIComponent[]) => void;
  isEditing?: boolean;
}

const ScriptUI: React.FC<ScriptUIProps> = ({
  components = [],
  parameters = [],
  onParametersChange,
  onExecute,
  onEdit,
  isEditing = false
}) => {
  const [paramValues, setParamValues] = useState<Record<string, any>>({});
  const [editableComponents, setEditableComponents] = useState<UIComponent[]>(components || []);
  
  const handleParameterChange = (paramId: string, value: any) => {
    const newValues = { ...paramValues, [paramId]: value };
    setParamValues(newValues);
    if (onParametersChange) {
      onParametersChange(newValues);
    }
  };
  
  const handleExecute = () => {
    if (onExecute) {
      onExecute();
    }
  };
  
  const handleEditSave = () => {
    if (onEdit) {
      onEdit(editableComponents);
    }
  };
  
  const addComponent = (parentId?: string) => {
    const newComponent: UIComponent = {
      id: `ui-${Date.now()}`,
      type: 'input',
      label: 'New Component'
    };
    
    if (parentId) {
      // Add to children of parent
      setEditableComponents(prevComponents => {
        const updateChildrenRecursive = (comps: UIComponent[]): UIComponent[] => {
          return comps.map(comp => {
            if (comp.id === parentId) {
              return {
                ...comp,
                children: [...(comp.children || []), newComponent]
              };
            } else if (comp.children) {
              return {
                ...comp,
                children: updateChildrenRecursive(comp.children)
              };
            }
            return comp;
          });
        };
        
        return updateChildrenRecursive(prevComponents);
      });
    } else {
      // Add to root level
      setEditableComponents(prev => [...prev, newComponent]);
    }
    
    toast.success('Component added');
  };
  
  const removeComponent = (id: string) => {
    const removeRecursive = (comps: UIComponent[]): UIComponent[] => {
      return comps.filter(comp => {
        if (comp.id === id) return false;
        if (comp.children) {
          comp.children = removeRecursive(comp.children);
        }
        return true;
      });
    };
    
    setEditableComponents(prev => removeRecursive(prev));
    toast.success('Component removed');
  };
  
  const updateComponent = (id: string, updates: Partial<UIComponent>) => {
    const updateRecursive = (comps: UIComponent[]): UIComponent[] => {
      return comps.map(comp => {
        if (comp.id === id) {
          return { ...comp, ...updates };
        } else if (comp.children) {
          return {
            ...comp,
            children: updateRecursive(comp.children)
          };
        }
        return comp;
      });
    };
    
    setEditableComponents(prev => updateRecursive(prev));
  };
  
  const renderEditableComponent = (component: UIComponent) => {
    return (
      <Card key={component.id} className="mb-3 border border-dashed border-primary/40">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <Input
              className="w-1/3 text-sm font-medium"
              value={component.label || ''}
              onChange={(e) => updateComponent(component.id, { label: e.target.value })}
              placeholder="Component Label"
            />
            
            <Select
              value={component.type}
              onValueChange={(value: any) => updateComponent(component.id, { type: value })}
            >
              <SelectTrigger className="w-1/3">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="input">Text Input</SelectItem>
                <SelectItem value="slider">Slider</SelectItem>
                <SelectItem value="checkbox">Checkbox</SelectItem>
                <SelectItem value="select">Dropdown</SelectItem>
                <SelectItem value="button">Button</SelectItem>
                <SelectItem value="container">Container</SelectItem>
                <SelectItem value="chart">Chart</SelectItem>
                <SelectItem value="table">Table</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex space-x-1">
              {component.type === 'container' && (
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => addComponent(component.id)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => removeComponent(component.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {component.type === 'container' && component.children && (
            <div className="pl-4 border-l border-border">
              {component.children.map(child => renderEditableComponent(child))}
            </div>
          )}
          
          {component.type === 'select' && (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-1">Options (comma separated)</p>
              <Input
                value={(component.options || []).join(', ')}
                onChange={(e) => {
                  const options = e.target.value.split(',').map(o => o.trim());
                  updateComponent(component.id, { options });
                }}
                placeholder="Option 1, Option 2, ..."
              />
            </div>
          )}
          
          {(component.type === 'chart' || component.type === 'table') && (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-1">Target Data Source</p>
              <Select
                value={component.target || ''}
                onValueChange={(value) => updateComponent(component.id, { target: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  {parameters.map(param => (
                    <SelectItem key={param.id} value={param.id}>{param.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
  
  const renderComponent = (component: UIComponent) => {
    switch (component.type) {
      case 'input':
        return (
          <div key={component.id} className="mb-4">
            {component.label && (
              <label className="block text-sm font-medium mb-1">{component.label}</label>
            )}
            <Input
              value={paramValues[component.target || ''] || ''}
              onChange={(e) => {
                if (component.target) {
                  handleParameterChange(component.target, e.target.value);
                }
              }}
              placeholder={component.label}
            />
          </div>
        );
      
      case 'slider':
        const sliderValue = paramValues[component.target || ''] || 0;
        return (
          <div key={component.id} className="mb-4">
            {component.label && (
              <div className="flex justify-between">
                <label className="block text-sm font-medium mb-1">{component.label}</label>
                <span className="text-sm">{sliderValue}</span>
              </div>
            )}
            <Slider
              value={[sliderValue]}
              onValueChange={(values) => {
                if (component.target) {
                  handleParameterChange(component.target, values[0]);
                }
              }}
              min={component.config?.min || 0}
              max={component.config?.max || 100}
              step={component.config?.step || 1}
            />
          </div>
        );
      
      case 'checkbox':
        return (
          <div key={component.id} className="flex items-center space-x-2 mb-4">
            <Checkbox
              checked={paramValues[component.target || ''] || false}
              onCheckedChange={(checked) => {
                if (component.target) {
                  handleParameterChange(component.target, checked);
                }
              }}
              id={component.id}
            />
            {component.label && (
              <label htmlFor={component.id} className="text-sm cursor-pointer">
                {component.label}
              </label>
            )}
          </div>
        );
      
      case 'select':
        return (
          <div key={component.id} className="mb-4">
            {component.label && (
              <label className="block text-sm font-medium mb-1">{component.label}</label>
            )}
            <Select
              value={paramValues[component.target || ''] || ''}
              onValueChange={(value) => {
                if (component.target) {
                  handleParameterChange(component.target, value);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${component.label || 'option'}`} />
              </SelectTrigger>
              <SelectContent>
                {(component.options || []).map((option, i) => (
                  <SelectItem key={i} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      
      case 'button':
        return (
          <div key={component.id} className="mb-4">
            <Button
              onClick={() => {
                if (component.handler === 'execute') {
                  handleExecute();
                }
              }}
            >
              {component.label || 'Button'}
            </Button>
          </div>
        );
      
      case 'container':
        return (
          <div key={component.id} className="mb-4">
            {component.label && (
              <h3 className="text-lg font-medium mb-2">{component.label}</h3>
            )}
            <div className="space-y-3">
              {component.children?.map(child => renderComponent(child))}
            </div>
          </div>
        );
        
      case 'chart':
        return (
          <div key={component.id} className="mb-4">
            {component.label && (
              <h3 className="text-lg font-medium mb-2">{component.label}</h3>
            )}
            <div className="h-64 border rounded-md flex items-center justify-center bg-secondary/20">
              <p className="text-muted-foreground">Chart visualization will render here</p>
            </div>
          </div>
        );
        
      case 'table':
        return (
          <div key={component.id} className="mb-4">
            {component.label && (
              <h3 className="text-lg font-medium mb-2">{component.label}</h3>
            )}
            <div className="border rounded-md p-4 bg-secondary/20">
              <p className="text-muted-foreground">Table data will render here</p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  const displayComponents = isEditing ? editableComponents : components;
  
  if (!displayComponents || displayComponents.length === 0) {
    if (isEditing) {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">UI Builder</h2>
            <Button onClick={handleEditSave}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          </div>
          
          <Card className="border-dashed border-primary/40">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">No UI components yet. Add your first component:</p>
              <Button onClick={() => addComponent()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Component
              </Button>
            </CardContent>
          </Card>
          
          {parameters && parameters.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Available Parameters</CardTitle>
                <CardDescription>Parameters detected from your script</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {parameters.map((param) => (
                    <li key={param.id} className="flex justify-between items-center p-2 rounded bg-secondary/20">
                      <div>
                        <span className="font-medium">{param.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">({param.type})</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => {
                        addComponent();
                        // Update the last added component to target this parameter
                        const lastId = `ui-${Date.now()}`;
                        setTimeout(() => {
                          updateComponent(lastId, { 
                            target: param.id,
                            label: param.name
                          });
                        }, 10);
                      }}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Script Parameters</h2>
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit([])}>
              <Edit className="mr-2 h-4 w-4" />
              Customize UI
            </Button>
          )}
        </div>
        
        <Card>
          <CardContent className="pt-6">
            {parameters && parameters.length > 0 ? (
              <div className="space-y-4">
                {parameters.map(param => (
                  <div key={param.id} className="mb-4">
                    <label className="block text-sm font-medium mb-1">{param.name}</label>
                    {param.type === 'boolean' ? (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={paramValues[param.id] || false}
                          onCheckedChange={(checked) => handleParameterChange(param.id, checked)}
                          id={param.id}
                        />
                        <label htmlFor={param.id} className="text-sm cursor-pointer">
                          {param.description || param.name}
                        </label>
                      </div>
                    ) : param.type === 'number' ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">{paramValues[param.id] || 0}</span>
                        </div>
                        <Slider
                          value={[paramValues[param.id] || 0]}
                          onValueChange={(values) => handleParameterChange(param.id, values[0])}
                          min={0}
                          max={100}
                          step={1}
                        />
                      </div>
                    ) : param.options ? (
                      <Select
                        value={paramValues[param.id] || ''}
                        onValueChange={(value) => handleParameterChange(param.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${param.name}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {param.options.map((option, i) => (
                            <SelectItem key={i} value={option.toString()}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={paramValues[param.id] || ''}
                        onChange={(e) => handleParameterChange(param.id, e.target.value)}
                        placeholder={param.description || `Enter ${param.name}`}
                      />
                    )}
                    {param.description && (
                      <p className="text-xs text-muted-foreground mt-1">{param.description}</p>
                    )}
                  </div>
                ))}
                
                <Button 
                  className="w-full mt-4" 
                  onClick={handleExecute}
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Execute Script
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">This script has no configurable parameters.</p>
                <Button 
                  className="mt-4" 
                  onClick={handleExecute}
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Execute Script
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {isEditing ? 'UI Builder' : 'Script Interface'}
        </h2>
        
        {isEditing ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditableComponents([])}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
            <Button onClick={handleEditSave}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          </div>
        ) : onEdit ? (
          <Button variant="outline" onClick={() => onEdit(displayComponents)}>
            <Settings className="mr-2 h-4 w-4" />
            Edit UI
          </Button>
        ) : null}
      </div>
      
      <ScrollArea className="h-[calc(100vh-24rem)]">
        <div className="space-y-2">
          {isEditing ? (
            <>
              <div className="flex justify-between mb-4">
                <Button variant="outline" onClick={() => addComponent()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Component
                </Button>
              </div>
              
              {editableComponents.map(component => renderEditableComponent(component))}
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4"
              >
                <Button onClick={handleEditSave} className="w-full">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview UI
                </Button>
              </motion.div>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6 pb-6">
                <div className="space-y-4">
                  {displayComponents.map(component => renderComponent(component))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ScriptUI;
