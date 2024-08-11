import { FormDescription } from "./ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Separator } from "./ui/separator"
import { Entity } from "@/types/supabase"

type EntitySelectorProps = {
  entities: Entity[];
  selectedEntity: string | undefined;
  onSelectChange: (value: string) => void;
  entityType: "fund" | "company" | "both";
  disabled: boolean;
}

export function EntitySelector({
  entities,
  selectedEntity,
  onSelectChange,
  entityType,
  disabled,
}: EntitySelectorProps) {
  const filteredEntities = entities.filter(
    (item) => entityType === "both" || item.type === entityType
  )

  return (
    <>
      <Select
        key={`select-${entities.length}`}
        value={selectedEntity}
        onValueChange={onSelectChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={
              entityType === "both"
                ? "Select or add an entity"
                : `Select a ${entityType}`
            }
          />
        </SelectTrigger>
        <SelectContent>
          {entityType === "both" && (
            <>
              <Separator />
              <SelectItem key="add-new-fund" value="add-new-fund">
                + New fund
              </SelectItem>
              <SelectItem key="add-new-company" value="add-new-company">
                + New company
              </SelectItem>
            </>
          )}
          {filteredEntities.map((item) => (
            <SelectItem key={`entity-${item.id}`} value={item.id}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {entityType === "both" && (
        <FormDescription>
          Add or edit an entity to be used in your signature block
        </FormDescription>
      )}
    </>
  )
}