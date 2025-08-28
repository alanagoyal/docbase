import React, { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getColorForGroup } from "@/utils/group-colors"
import { createClient } from "@/utils/supabase/client"
import { Plus, X } from "lucide-react"
import debounce from "lodash/debounce"
import { HslColorPicker, HslColor } from "react-colorful"

import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
import { Input } from "./ui/input"
import { toast } from "./ui/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { clientLogger } from "@/lib/client-logger"

type Group = { id: string; name: string; color: string }

interface GroupsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onGroupsChange?: () => void; // Add this new prop
}

// Add this helper function to convert HSL string to HslColor object
const hslStringToObject = (hslString: string): HslColor => {
  const match = hslString.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/)
  if (match) {
    return {
      h: parseInt(match[1]),
      s: parseFloat(match[2]),
      l: parseFloat(match[3])
    }
  }
  return { h: 0, s: 0, l: 0 } // Default color if parsing fails
}

export function GroupsDialog({ isOpen, onClose, userId, onGroupsChange }: GroupsDialogProps) {
  const [groups, setGroups] = useState<Group[]>([])
  const supabase = createClient()
  const router = useRouter()
  const [newGroupId, setNewGroupId] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [openColorPicker, setOpenColorPicker] = useState<string | null>(null)

  const saveGroups = useCallback(async (groupsToSave: Group[]) => {
    const { error } = await supabase.from("groups").upsert(groupsToSave)
    if (error) {
      clientLogger.error('Error updating groups', { error })
    } else {
      setHasChanges(true)
      router.refresh()
    }
  }, [supabase, router])

  const debouncedSave = useCallback(debounce(saveGroups, 500), [saveGroups])

  useEffect(() => {
    return () => {
      debouncedSave.cancel()
    }
  }, [debouncedSave])

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .eq("created_by", userId)

    if (error) {
      clientLogger.error('Error fetching groups', { error })
      toast({ variant: "destructive", description: "Failed to fetch groups" })
    } else {
      setGroups(data || [])
    }
  }

  const handleGroupChange = (
    index: number,
    field: keyof Group,
    value: string
  ) => {
    const newGroups = [...groups]
    newGroups[index] = { ...newGroups[index], [field]: value }
    setGroups(newGroups)
    debouncedSave(newGroups)
  }

  const handleRemoveGroup = async (id: string) => {
    const { error } = await supabase.from("groups").delete().eq("id", id)

    if (error) {
      clientLogger.error('Error removing group', { error })
      toast({ variant: "destructive", description: "Failed to remove group" })
    } else {
      setGroups(groups.filter((group) => group.id !== id))
      setHasChanges(true)
      router.refresh()
      toast({ description: "Group removed successfully" })
    }
  }

  const handleAddGroup = async () => {
    const newColor = getColorForGroup(groups.length)
    const { data, error } = await supabase
      .from("groups")
      .insert({ name: "", color: newColor, created_by: userId })
      .select()

    if (error) {
      clientLogger.error('Error adding group', { error })
    } else if (data) {
      setGroups([...groups, data[0]])
      setNewGroupId(data[0].id)
      setHasChanges(true)
    }
  }

  const handleColorChange = (id: string, color: HslColor) => {
    const hslString = `hsl(${color.h}, ${color.s}%, ${color.l}%)`
    const newGroups = groups.map(group =>
      group.id === id ? { ...group, color: hslString } : group
    )
    setGroups(newGroups)
    debouncedSave(newGroups)
  }

  const handleClose = () => {
    debouncedSave.flush()
    if (hasChanges) {
      toast({ description: "Groups changes saved successfully" })
      setHasChanges(false)
      if (onGroupsChange) {
        onGroupsChange() // Call this function to notify parent component of changes
      }
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Groups</DialogTitle>
          <DialogDescription>
            Add, edit, and remove groups for your contacts
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {groups.map((group) => (
            <div key={group.id} className="flex items-center space-x-2">
              <Popover open={openColorPicker === group.id} onOpenChange={(open) => setOpenColorPicker(open ? group.id : null)}>
                <PopoverTrigger asChild>
                  <Button
                    className="w-8 h-8 rounded-full p-0 flex-shrink-0"
                    style={{ backgroundColor: group.color }}
                    aria-label={`Change color for ${group.name || 'Unnamed group'}`}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <HslColorPicker
                    color={hslStringToObject(group.color)}
                    onChange={(color) => handleColorChange(group.id, color)}
                  />
                </PopoverContent>
              </Popover>
              <Input
                value={group.name}
                onChange={(e) =>
                  handleGroupChange(groups.indexOf(group), "name", e.target.value)
                }
                placeholder="Group name"
                autoFocus={group.id === newGroupId}
                onFocus={() => setNewGroupId(null)}
                aria-label={`Name for ${group.name || 'Unnamed group'}`}
              />
              <Button
                variant="ghost"
                onClick={() => handleRemoveGroup(group.id)}
                aria-label={`Remove ${group.name || 'Unnamed group'}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button onClick={handleAddGroup} className="w-full" variant="ghost">
            <Plus className="h-4 w-4 mr-2" /> Add Group
          </Button>
          <Button onClick={handleClose} className="w-full">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
