import {
  decorateBlock, decorateButtons, decorateIcons, loadBlock,
} from './lib-franklin.js';

function handleEditorUpdate(event) {
  const { detail: { itemids, payload } } = event;
  Promise.all(itemids
    .map(async (itemId, i) => {
      const element = document.querySelector(`[itemid="${itemId}"]`)
      const block = element.closest('.block');
      const blockItemId = block?.getAttribute('itemid');
      if (block && blockItemId?.startsWith('urn:aemconnection:')) {
        const htmlContent = payload[i]?.content?.html;
        const main = new DOMParser().parseFromString(htmlContent, 'text/html')
        const newBlock = main.querySelector(`[itemid="${blockItemId}"]`)
        if(newBlock) {
          newBlock.style.display = 'none';
          block.insertAdjacentElement('afterend', newBlock);
          // decorate buttons and icons
          decorateButtons(newBlock);
          decorateIcons(newBlock);
          // decorate and load the block
          decorateBlock(newBlock);
          await loadBlock(newBlock);
          // remove the old block and show the new one
          block.remove();
          newBlock.style.display = 'unset';
          return Promise.resolve();
        }
      }
      return Promise.reject();
    }))
    .catch(() => {
      // fallback to a full reload if any item could not be reloaded
      window.location.reload();
    });
}

document.addEventListener('editor-update', handleEditorUpdate);
