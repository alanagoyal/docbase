import React, { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getColorForGroup } from "@/utils/group-colors"
import { createClient } from "@/utils/supabase/client"
import { Plus, X } from "lucide-react"
import debounce from "lodash/debounce"

import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Input } from "./ui/input"
import { toast } from "./ui/use-toast"

type Group = { id: string; name: string; color: string }

interface GroupsDialogProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

export function GroupsDialog({ isOpen, onClose, userId }: GroupsDialogProps) {
  const [groups, setGroups] = useState<Group[]>([])
  const supabase = createClient()
  const router = useRouter()
  const [newGroupId, setNewGroupId] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  const saveGroups = useCallback(async (groupsToSave: Group[]) => {
    const { error } = await supabase.from("groups").upsert(groupsToSave)
    if (error) {
      console.error("Error updating groups:", error)
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
      console.error("Error fetching groups:", error)
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
      console.error("Error removing group:", error)
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
      console.error("Error adding group:", error)
    } else if (data) {
      setGroups([...groups, data[0]])
      setNewGroupId(data[0].id)
      setHasChanges(true)
    }
  }

  const handleClose = () => {
    debouncedSave.flush()
    if (hasChanges) {
      toast({ description: "Groups changes saved successfully" })
      setHasChanges(false)
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Groups</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {groups.map((group, index) => (
            <div key={group.id} className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded-full flex-shrink-0"
                style={{ backgroundColor: group.color }}
              ></div>
              <Input
                value={group.name}
                onChange={(e) =>
                  handleGroupChange(index, "name", e.target.value)
                }
                placeholder="Group name"
                autoFocus={group.id === newGroupId}
                onFocus={() => setNewGroupId(null)}
              />
              <Button
                variant="ghost"
                onClick={() => handleRemoveGroup(group.id)}
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
