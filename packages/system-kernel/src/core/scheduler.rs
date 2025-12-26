// system-kernel/src/core/scheduler.rs
//
// Deterministic Task Scheduler
// ----------------------------
// Provides strict task ordering with priority and deadline support.
// Designed for safety-critical systems where predictability matters
// more than throughput.

use std::collections::{BinaryHeap, HashMap};
use std::cmp::Ordering;
use std::time::{Duration, Instant};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct TaskId(pub u64);

#[derive(Debug, Clone)]
pub struct Task {
    pub id: TaskId,
    pub priority: u8,            // 0 = highest
    pub deadline: Option<Instant>,
    pub created_at: Instant,
}

#[derive(Debug)]
struct ScheduledTask {
    task: Task,
}

impl Ord for ScheduledTask {
    fn cmp(&self, other: &Self) -> Ordering {
        // Lower priority value = higher priority
        match self.task.priority.cmp(&other.task.priority) {
            Ordering::Equal => {
                match (&self.task.deadline, &other.task.deadline) {
                    (Some(a), Some(b)) => b.cmp(a),
                    (Some(_), None) => Ordering::Greater,
                    (None, Some(_)) => Ordering::Less,
                    (None, None) => other.task.created_at.cmp(&self.task.created_at),
                }
            }
            other => other.reverse(),
        }
    }
}

impl PartialOrd for ScheduledTask {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl PartialEq for ScheduledTask {
    fn eq(&self, other: &Self) -> bool {
        self.task.id == other.task.id
    }
}

impl Eq for ScheduledTask {}

#[derive(Debug)]
pub struct Scheduler {
    queue: BinaryHeap<ScheduledTask>,
    registry: HashMap<TaskId, Task>,
    next_id: u64,
}

#[derive(Debug)]
pub enum SchedulerError {
    TaskNotFound,
    DeadlineMissed(TaskId),
}

impl Scheduler {
    pub fn new() -> Self {
        Self {
            queue: BinaryHeap::new(),
            registry: HashMap::new(),
            next_id: 1,
        }
    }

    pub fn submit(
        &mut self,
        priority: u8,
        deadline: Option<Duration>,
    ) -> TaskId {
        let id = TaskId(self.next_id);
        self.next_id += 1;

        let now = Instant::now();
        let task = Task {
            id,
            priority,
            deadline: deadline.map(|d| now + d),
            created_at: now,
        };

        self.queue.push(ScheduledTask { task: task.clone() });
        self.registry.insert(id, task);

        id
    }

    pub fn next(&mut self) -> Result<Task, SchedulerError> {
        let scheduled = self.queue.pop().ok_or(SchedulerError::TaskNotFound)?;
        let task = scheduled.task;

        if let Some(deadline) = task.deadline {
            if Instant::now() > deadline {
                return Err(SchedulerError::DeadlineMissed(task.id));
            }
        }

        self.registry.remove(&task.id);
        Ok(task)
    }

    pub fn pending(&self) -> usize {
        self.queue.len()
    }

    pub fn contains(&self, id: TaskId) -> bool {
        self.registry.contains_key(&id)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn higher_priority_runs_first() {
        let mut s = Scheduler::new();
        let _low = s.submit(5, None);
        let high = s.submit(0, None);

        let next = s.next().unwrap();
        assert_eq!(next.id, high);
    }

    #[test]
    fn deadlines_are_enforced() {
        let mut s = Scheduler::new();
        let id = s.submit(1, Some(Duration::from_millis(1)));
        std::thread::sleep(Duration::from_millis(5));
        let err = s.next().unwrap_err();
        match err {
            SchedulerError::DeadlineMissed(tid) => assert_eq!(tid, id),
            _ => panic!("unexpected error"),
        }
    }
}
