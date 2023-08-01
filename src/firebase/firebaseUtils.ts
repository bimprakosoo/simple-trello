import { db } from '../../firebaseConfig';

interface DraggableCardProps {
  id: string;
  draggableId: string;
  cardText: string;
}

export const updateColumnCards = async (columnId: string, updatedCards: any[]) => {
  try {
    const columnDocRef = db.collection('columns').doc(columnId);
    await columnDocRef.update({ cards: updatedCards });
  } catch (error) {
    console.error(`Error updating ${columnId} document:`, error);
  }
}

export const addCard = async (updatedTodoColumn: any) => {
  try {
    db.collection('columns')
      .doc('todo')
      .set({ cards: updatedTodoColumn.cards }, { merge: true }) // Save the 'cards' array directly under the specific document
      .catch((error) => {
        console.error('Error updating document:', error);
      });
  } catch (error) {
    console.error(`Error adding new card:`, error);
  }
}

export const fetchDataColumn = async (columnId: string): Promise<any[]> => {
  try {
    const columnDocRef = db.collection('columns').doc(columnId);
    const snapshot = await columnDocRef.get();
    return snapshot.exists ? snapshot.data()?.cards : [];
  } catch (error) {
    console.error(`Error fetching data from ${columnId} document:`, error);
    return [];
  }
}

export const updateCardDescription = async ({ draggableId, cardText }: DraggableCardProps) => {
  try {
    const todoDocRef = db.collection('columns').doc('todo');
    const progressDocRef = db.collection('columns').doc('progress');
    const doneDocRef = db.collection('columns').doc('done');

    // Use a Firestore transaction to update the card's description
    await db.runTransaction(async (transaction) => {
      // Fetch the current data of the documents
      const todoDoc = await transaction.get(todoDocRef);
      const progressDoc = await transaction.get(progressDocRef);
      const doneDoc = await transaction.get(doneDocRef);

      // Check if the card exists in the "cards" array
      const todoCards = todoDoc.exists ? todoDoc.data()?.cards : [];
      const progressCards = todoDoc.exists ? progressDoc.data()?.cards : [];
      const doneCards = todoDoc.exists ? doneDoc.data()?.cards : [];
      const todoCardIndex = todoCards.findIndex((card: DraggableCardProps) => card.id === draggableId);
      const progressCardIndex = progressCards.findIndex((card: DraggableCardProps) => card.id === draggableId);
      const doneCardIndex = doneCards.findIndex((card: DraggableCardProps) => card.id === draggableId);

      // Update the card's description if it exists in the "cards" array
      if (todoCardIndex !== -1) {
        const updatedTodoCards = [...todoCards];
        updatedTodoCards[todoCardIndex] = { ...updatedTodoCards[todoCardIndex], text: cardText };
        transaction.update(todoDocRef, { cards: updatedTodoCards });
      } else if (progressCardIndex !== -1) {
        const updatedProgressCards = [...progressCards];
        updatedProgressCards[progressCardIndex] = { ...updatedProgressCards[progressCardIndex], text: cardText };
        transaction.update(progressDocRef, { cards: updatedProgressCards });
      } else if (doneCardIndex !== -1) {
        const updatedDoneCards = [...doneCards];
        updatedDoneCards[doneCardIndex] = { ...updatedDoneCards[doneCardIndex], text: cardText };
        transaction.update(doneDocRef, { cards: updatedDoneCards });
      }
    });
  } catch (error) {
    console.error('Error updating card description:', error);
  }
};