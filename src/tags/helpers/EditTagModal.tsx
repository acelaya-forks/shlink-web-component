import { Result } from '@shlinkio/shlink-frontend-kit';
import { useCallback, useState } from 'react';
import { Button, Input, InputGroup, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { ShlinkApiError } from '../../common/ShlinkApiError';
import type { FCWithDeps } from '../../container/utils';
import { componentFactory, useDependencies } from '../../container/utils';
import { ColorPicker } from '../../utils/components/ColorPicker';
import { usePreventDefault } from '../../utils/helpers';
import type { ColorGenerator } from '../../utils/services/ColorGenerator';
import type { TagModalProps } from '../data';
import type { EditTag, TagEdition } from '../reducers/tagEdit';

interface EditTagModalProps extends TagModalProps {
  tagEdit: TagEdition;
  editTag: (editTag: EditTag) => Promise<void>;
  tagEdited: (tagEdited: EditTag) => void;
}

type EditTagModalDeps = {
  ColorGenerator: ColorGenerator;
};

const EditTagModal: FCWithDeps<EditTagModalProps, EditTagModalDeps> = (
  { tag, editTag, onClose, tagEdited, isOpen, tagEdit },
) => {
  const { ColorGenerator: colorGenerator } = useDependencies(EditTagModal);
  const [newTagName, setNewTagName] = useState(tag);
  const [color, setColor] = useState(colorGenerator.getColorForKey(tag));
  const { editing, error, edited, errorData } = tagEdit;
  const saveTag = usePreventDefault(async () => {
    await editTag({ oldName: tag, newName: newTagName, color });
    onClose();
  });
  const onClosed = useCallback(
    () => edited && tagEdited({ oldName: tag, newName: newTagName, color }),
    [color, edited, newTagName, tag, tagEdited],
  );

  return (
    <Modal isOpen={isOpen} toggle={onClose} centered onClosed={onClosed}>
      <form name="editTag" onSubmit={saveTag}>
        <ModalHeader toggle={onClose}>Edit tag</ModalHeader>
        <ModalBody>
          <InputGroup>
            <ColorPicker color={color} onChange={setColor} className="input-group-text" name="tag-color" />
            <Input
              value={newTagName}
              placeholder="Tag"
              required
              onChange={({ target }) => setNewTagName(target.value)}
            />
          </InputGroup>

          {error && (
            <Result type="error" small className="mt-2">
              <ShlinkApiError errorData={errorData} fallbackMessage="Something went wrong while editing the tag :(" />
            </Result>
          )}
        </ModalBody>
        <ModalFooter>
          <Button type="button" color="link" onClick={onClose}>Cancel</Button>
          <Button color="primary" disabled={editing}>{editing ? 'Saving...' : 'Save'}</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export const EditTagModalFactory = componentFactory(EditTagModal, ['ColorGenerator']);
