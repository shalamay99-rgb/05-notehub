import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createNote, deleteNote, fetchNotes } from "../../services/noteService";
import NoteList from "../NoteList/NoteList";
import Pagination from "../Pagination/Pagination";
import { useDebouncedCallback } from "use-debounce";
import SearchBox from "../SearchBox/SearchBox";
import type { CreateNoteParams } from "../../services/noteService";
import Modal from "../Modal/Modal";
import NoteForm from "../NoteForm/NoteForm";
import css from "./App.module.css";

function App() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const perPage = 12;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notes"],
      });
      setIsModalOpen(false);
    },
  });

  const handleCreate = (newNote: CreateNoteParams) => {
    createMutation.mutate(newNote);
  };
  const { data, isLoading, isError } = useQuery({
    queryKey: ["notes", page, perPage, search],
    queryFn: () => fetchNotes({ page, perPage, search }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notes"],
      });
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, 300);
  return (
    <div className={css.app}>
      <div className={css.toolbar}>
        <SearchBox onSearch={debouncedSearch} />

        <button type="button" onClick={handleOpen} className={css.button}>
          Create note
        </button>
      </div>

      {data && data.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={data.totalPages}
          onPageChange={setPage}
        />
      )}
      {isLoading && <p>Loading...</p>}
      {isError && <p>Something went wrong.</p>}
      {data && data.notes.length > 0 && (
        <NoteList notes={data.notes} onDelete={handleDelete} />
      )}
      {isModalOpen && (
        <Modal onClose={handleClose}>
          <NoteForm onSubmit={handleCreate} onCancel={handleClose} />
        </Modal>
      )}
      {data && data.notes.length === 0 && <p>No notes found</p>}
    </div>
  );
}

export default App;
